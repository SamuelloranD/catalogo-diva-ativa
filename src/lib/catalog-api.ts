import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProduct,
  ProductInput,
} from "@/lib/catalog-types";

function getClient() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicImageUrl(path: string) {
  const client = getClient();
  return client.storage.from("catalog-images").getPublicUrl(path).data.publicUrl;
}

export { isSupabaseConfigured, slugify };

export async function listCategories(): Promise<CatalogCategory[]> {
  const { data, error } = await getClient()
    .from("categories")
    .select("id,name,slug,active,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    active: category.active,
    sortOrder: category.sort_order,
  }));
}

export async function listProducts({ active = true }: { active?: boolean } = {}): Promise<
  CatalogProduct[]
> {
  const client = getClient();
  const [
    { data: productRows, error: productError },
    { data: categoryRows, error: categoryError },
    { data: imageRows, error: imageError },
  ] = await Promise.all([
    client
      .from("products")
      .select("id,name,category_id,brand,description,color_label,tag,active,sort_order")
      .eq("active", active)
      .order("sort_order", { ascending: true }),
    client.from("categories").select("id,name").eq("active", true),
    client
      .from("product_images")
      .select("id,product_id,storage_path,position,alt_text")
      .order("position", { ascending: true }),
  ]);

  if (productError) throw productError;
  if (categoryError) throw categoryError;
  if (imageError) throw imageError;

  const categories = new Map(categoryRows.map((category) => [category.id, category.name]));
  const imagesByProduct = new Map<string, CatalogImage[]>();

  for (const image of imageRows) {
    const mapped: CatalogImage = {
      id: image.id,
      productId: image.product_id,
      storagePath: image.storage_path,
      url: publicImageUrl(image.storage_path),
      position: image.position,
      altText: image.alt_text,
    };
    imagesByProduct.set(image.product_id, [
      ...(imagesByProduct.get(image.product_id) ?? []),
      mapped,
    ]);
  }

  return productRows.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: categories.get(product.category_id) ?? "Sem categoria",
    categoryId: product.category_id,
    color: product.color_label,
    images: (imagesByProduct.get(product.id) ?? []).map((image) => image.url),
    imageRecords: imagesByProduct.get(product.id) ?? [],
    tag: product.tag,
    description: product.description,
    active: product.active,
    sortOrder: product.sort_order,
  }));
}

export async function createCategory(name: string, sortOrder = 0) {
  const { data, error } = await getClient()
    .from("categories")
    .insert({ name: name.trim(), slug: slugify(name), sort_order: sortOrder })
    .select("id,name,slug,active,sort_order")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    active: data.active,
    sortOrder: data.sort_order,
  } satisfies CatalogCategory;
}

export async function updateCategory(id: string, name: string) {
  const { error } = await getClient()
    .from("categories")
    .update({ name: name.trim(), slug: slugify(name) })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await getClient().from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(product: Pick<CatalogProduct, "id" | "imageRecords">) {
  for (const image of product.imageRecords ?? []) {
    await deleteProductImage(image);
  }

  const { error } = await getClient().from("products").delete().eq("id", product.id);
  if (error) throw error;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const { data, error } = await getClient()
    .from("products")
    .insert({
      name: input.name.trim(),
      category_id: input.categoryId,
      brand: input.brand.trim() || "Diva Ativa",
      description: input.description.trim(),
      color_label: input.colorLabel.trim() || "Cores disponíveis",
      tag: input.tag.trim(),
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateProduct(id: string, input: ProductInput) {
  const { error } = await getClient()
    .from("products")
    .update({
      name: input.name.trim(),
      category_id: input.categoryId,
      brand: input.brand.trim() || "Diva Ativa",
      description: input.description.trim(),
      color_label: input.colorLabel.trim() || "Cores disponíveis",
      tag: input.tag.trim(),
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function archiveProduct(id: string) {
  const { error } = await getClient().from("products").update({ active: false }).eq("id", id);
  if (error) throw error;
}

export async function restoreProduct(id: string) {
  const { error } = await getClient().from("products").update({ active: true }).eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(productId: string, file: File, position: number) {
  const client = getClient();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${productId}/${crypto.randomUUID()}-${safeName}`;
  const upload = await client.storage.from("catalog-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (upload.error) throw upload.error;

  const { data, error } = await client
    .from("product_images")
    .insert({ product_id: productId, storage_path: path, position, alt_text: file.name })
    .select("id,product_id,storage_path,position,alt_text")
    .single();

  if (error) {
    await client.storage.from("catalog-images").remove([path]);
    throw error;
  }

  return {
    id: data.id,
    productId: data.product_id,
    storagePath: data.storage_path,
    url: publicImageUrl(data.storage_path),
    position: data.position,
    altText: data.alt_text,
  } satisfies CatalogImage;
}

export async function deleteProductImage(image: Pick<CatalogImage, "id" | "storagePath">) {
  const client = getClient();
  const storageResult = await client.storage.from("catalog-images").remove([image.storagePath]);
  if (storageResult.error) throw storageResult.error;

  const { error } = await client.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
}

export async function reorderProductImages(
  images: Array<Pick<CatalogImage, "id"> & { position?: number }>,
) {
  const client = getClient();
  const results = await Promise.all(
    images.map((image, index) =>
      client
        .from("product_images")
        .update({ position: image.position ?? index })
        .eq("id", image.id),
    ),
  );
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;
}
