import { supabase } from "@/lib/supabase";

export type HeroContent = {
  title: string;
  highlight: string;
  description: string;
  buttonLabel: string;
};

export const HERO_TEXT_LIMITS = {
  title: 14,
  highlight: 18,
  description: 80,
  buttonLabel: 18,
} as const;

export const DEFAULT_HERO_CONTENT: HeroContent = {
  title: "Vista sua",
  highlight: "melhor versão.",
  description: "Do treino ao seu dia a dia, encontre o look que acompanha você.",
  buttonLabel: "Explorar peças",
};

export async function getHeroContent(): Promise<HeroContent> {
  if (!supabase) return DEFAULT_HERO_CONTENT;

  const { data, error } = await supabase
    .from("site_content")
    .select("title,highlight,description,button_label")
    .eq("id", "home")
    .single();
  if (error) throw error;
  return {
    title: data.title,
    highlight: data.highlight,
    description: data.description,
    buttonLabel: data.button_label,
  };
}

export async function saveHeroContent(input: HeroContent): Promise<void> {
  if (!supabase) throw new Error("Supabase não está configurado.");

  const content = {
    title: input.title.trim(),
    highlight: input.highlight.trim(),
    description: input.description.trim(),
    buttonLabel: input.buttonLabel.trim(),
  };
  for (const field of Object.keys(HERO_TEXT_LIMITS) as Array<keyof HeroContent>) {
    if (!content[field]) throw new Error("Preencha todos os textos do banner.");
    if (content[field].length > HERO_TEXT_LIMITS[field]) {
      throw new Error(`O campo aceita no máximo ${HERO_TEXT_LIMITS[field]} caracteres.`);
    }
  }

  const { error } = await supabase
    .from("site_content")
    .update({
      title: content.title,
      highlight: content.highlight,
      description: content.description,
      button_label: content.buttonLabel,
    })
    .eq("id", "home");
  if (error) throw error;
}
