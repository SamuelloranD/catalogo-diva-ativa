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
    .select("id,name,slug,active,sort_order,created_at")
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
    createdAt: category.created_at,
  }));
}

export async function listProducts({ active = true }: { active?: boolean } = {}): Promise<
  CatalogProduct[]
> {
  const client = getClient();
  const productRequest = async () => {
    const current = await client
      .from("products")
      .select(
        "id,name,category_id,brand,description,color_label,tag,price,active,sort_order,created_at,sizes,colors",
      )
      .eq("active", active)
      .order("sort_order", { ascending: true });
    if (!current.error) return current.data;
    if (!["42703", "PGRST204"].includes(current.error.code)) throw current.error;
    const legacy = await client
      .from("products")
      .select(
        "id,name,category_id,brand,description,color_label,tag,price,active,sort_order,created_at",
      )
      .eq("active", active)
      .order("sort_order", { ascending: true });
    if (legacy.error) throw legacy.error;
    return legacy.data.map((product) => ({ ...product, sizes: null, colors: null }));
  };
  const [
    productRows,
    { data: categoryRows, error: categoryError },
    { data: imageRows, error: imageError },
    { data: relationRows, error: relationError },
  ] = await Promise.all([
    productRequest(),
    client.from("categories").select("id,name").eq("active", true),
    client
      .from("product_images")
      .select("id,product_id,storage_path,position,alt_text")
      .order("position", { ascending: true }),
    client.from("product_categories").select("product_id,category_id"),
  ]);

  if (categoryError) throw categoryError;
  if (imageError) throw imageError;
  if (relationError && !["42P01", "PGRST205"].includes(relationError.code)) throw relationError;

  const categories = new Map(categoryRows.map((category) => [category.id, category.name]));
  const imagesByProduct = new Map<string, CatalogImage[]>();
  const categoryIdsByProduct = new Map<string, string[]>();
  for (const relation of relationRows ?? []) {
    categoryIdsByProduct.set(relation.product_id, [
      ...(categoryIdsByProduct.get(relation.product_id) ?? []),
      relation.category_id,
    ]);
  }

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
    categoryIds: [
      ...new Set([product.category_id, ...(categoryIdsByProduct.get(product.id) ?? [])]),
    ],
    categories: [...new Set([product.category_id, ...(categoryIdsByProduct.get(product.id) ?? [])])]
      .map((id) => categories.get(id))
      .filter((name): name is string => Boolean(name)),
    color: product.color_label,
    colors: Array.isArray(product.colors) ? product.colors : [],
    ...(Array.isArray(product.sizes) ? { sizes: product.sizes } : {}),
    images: (imagesByProduct.get(product.id) ?? []).map((image) => image.url),
    imageRecords: imagesByProduct.get(product.id) ?? [],
    tag: product.tag,
    description: product.description,
    ...(product.price == null ? {} : { price: Number(product.price) }),
    active: product.active,
    sortOrder: product.sort_order,
    createdAt: product.created_at,
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
      price: input.price ?? null,
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
      sizes: input.sizes ?? null,
      colors: input.colors ?? [],
    })
    .select("id")
    .single();

  if (error) throw error;
  await saveProductCategories(data.id, input);
  return data.id;
}

async function saveProductCategories(id: string, input: ProductInput) {
  const client = getClient();
  const ids = [...new Set([input.categoryId, ...(input.categoryIds ?? [])])];
  const { error: deleteError } = await client
    .from("product_categories")
    .delete()
    .eq("product_id", id);
  if (deleteError) throw deleteError;
  const { error } = await client
    .from("product_categories")
    .insert(ids.map((categoryId) => ({ product_id: id, category_id: categoryId })));
  if (error) throw error;
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
      price: input.price ?? null,
      active: input.active ?? true,
      sort_order: input.sortOrder ?? 0,
      sizes: input.sizes ?? null,
      colors: input.colors ?? [],
    })
    .eq("id", id);

  if (error) throw error;
  await saveProductCategories(id, input);
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
