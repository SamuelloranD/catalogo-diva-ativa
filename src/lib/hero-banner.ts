import { supabase } from "@/lib/supabase";

const BUCKET = "catalog-images";
const BANNER_PATH = "site/home-banner";
const MAX_BANNER_SIZE = 6 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function getClient() {
  if (!supabase) throw new Error("Supabase não está configurado.");
  return supabase;
}

function publicBannerUrl(version: string | number) {
  const url = getClient().storage.from(BUCKET).getPublicUrl(BANNER_PATH).data.publicUrl;
  return `${url}?v=${encodeURIComponent(version)}`;
}

export async function getHeroBannerUrl(): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.storage.from(BUCKET).list("site", {
    search: "home-banner",
  });
  if (error) throw error;

  const image = data.find((file) => file.name === "home-banner");
  return image ? publicBannerUrl(image.updated_at ?? image.created_at ?? "1") : null;
}

export async function saveHeroBanner(file: File): Promise<string> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error("Escolha uma imagem JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size > MAX_BANNER_SIZE) {
    throw new Error("A imagem deve ter até 6 MB.");
  }

  const { error } = await getClient().storage.from(BUCKET).upload(BANNER_PATH, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw error;

  return publicBannerUrl(Date.now());
}

export async function removeHeroBanner(): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).remove([BANNER_PATH]);
  if (error) throw error;
}
