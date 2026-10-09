import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

import { categories, products } from "./catalog-seed-data.mjs";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de executar o seed.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureCategory(name, sortOrder) {
  const slug = slugify(name);
  const existing = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.id;

  const inserted = await supabase
    .from("categories")
    .insert({ name, slug, sort_order: sortOrder })
    .select("id")
    .single();
  if (inserted.error) throw inserted.error;
  return inserted.data.id;
}

async function ensureProduct(product, categoryId, sortOrder) {
  const existing = await supabase
    .from("products")
    .select("id")
    .eq("name", product.name)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const values = {
    name: product.name,
    category_id: categoryId,
    brand: product.brand,
    description: "Consulte tamanhos e disponibilidade pelo WhatsApp.",
    color_label: "Cores disponíveis",
    tag: "",
    active: true,
    sort_order: sortOrder,
  };

  if (existing.data) {
    const updated = await supabase
      .from("products")
      .update(values)
      .eq("id", existing.data.id)
      .select("id")
      .single();
    if (updated.error) throw updated.error;
    return updated.data.id;
  }

  const inserted = await supabase.from("products").insert(values).select("id").single();
  if (inserted.error) throw inserted.error;
  return inserted.data.id;
}

async function replaceProductImages(productId, files) {
  const current = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);
  if (current.error) throw current.error;

  if (current.data.length > 0) {
    const removed = await supabase.storage
      .from("catalog-images")
      .remove(current.data.map((image) => image.storage_path));
    if (removed.error) throw removed.error;
    const deleted = await supabase.from("product_images").delete().eq("product_id", productId);
    if (deleted.error) throw deleted.error;
  }

  for (const [position, relativePath] of files.entries()) {
    if (!existsSync(relativePath)) throw new Error(`Imagem não encontrada: ${relativePath}`);
    const file = readFileSync(relativePath);
    const storagePath = `${productId}/${String(position + 1).padStart(2, "0")}-${basename(relativePath)}`;
    const uploaded = await supabase.storage.from("catalog-images").upload(storagePath, file, {
      contentType: relativePath.endsWith(".webp")
        ? "image/webp"
        : relativePath.endsWith(".png")
          ? "image/png"
          : "image/jpeg",
      upsert: true,
    });
    if (uploaded.error) throw uploaded.error;

    const inserted = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      position,
      alt_text: `${productId} ${position + 1}`,
    });
    if (inserted.error) throw inserted.error;
  }
}

const categoryIds = new Map();
for (const [sortOrder, name] of categories.entries()) {
  categoryIds.set(name, await ensureCategory(name, sortOrder));
}

for (const [sortOrder, product] of products.entries()) {
  const categoryId = categoryIds.get(product.category);
  const productId = await ensureProduct(product, categoryId, sortOrder);
  await replaceProductImages(productId, product.files);
  console.log(`Importado: ${product.name}`);
}

console.log(`Seed concluído: ${products.length} produtos e ${categories.length} categorias.`);
