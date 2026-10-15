import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

import defaultBanner from "@/assets/atletika/macacao-marta/1.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getHeroBannerUrl, removeHeroBanner, saveHeroBanner } from "@/lib/hero-banner";
import {
  DEFAULT_HERO_CONTENT,
  getHeroContent,
  HERO_TEXT_LIMITS,
  saveHeroContent,
  type HeroContent,
} from "@/lib/hero-content";

function errorMessage(reason: unknown) {
  if (
    reason &&
    typeof reason === "object" &&
    "code" in reason &&
    (reason.code === "PGRST205" || reason.code === "42P01" || reason.code === "PGRST116") &&
    "message" in reason &&
    typeof reason.message === "string" &&
    reason.message.includes("site_content")
  ) {
    return "Configuração do texto indisponível. Aplique a migração 20261015_home_banner_content.sql no Supabase.";
  }
  return reason instanceof Error ? reason.message : "Não foi possível atualizar o banner.";
}

export function BannerManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentSaving, setContentSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getHeroBannerUrl()
      .then((url) => {
        if (mounted) setImageUrl(url);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getHeroContent()
      .then((nextContent) => {
        if (mounted) setContent(nextContent);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(errorMessage(reason));
      })
      .finally(() => {
        if (mounted) setContentLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== "function") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function save() {
    if (!file) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      setImageUrl(await saveHeroBanner(file));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice("Banner atualizado.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  async function restoreDefault() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await removeHeroBanner();
      setImageUrl(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice("Imagem padrão restaurada.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  async function saveText() {
    setContentSaving(true);
    setError("");
    setNotice("");
    try {
      await saveHeroContent(content);
      setNotice("Texto do banner atualizado.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setContentSaving(false);
    }
  }

  return (
    <section className="admin-panel rounded-xl border bg-background p-4 shadow-sm sm:p-7">
      <h1 className="font-display text-3xl sm:text-4xl">Banner da página principal</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Atualize a imagem e os textos de destaque da página inicial.
      </p>
      <div className="catalog-hero relative isolate mt-6 overflow-hidden rounded-md border bg-secondary">
        <img
          src={previewUrl ?? imageUrl ?? defaultBanner}
          alt="Banner atual da página principal"
          className="absolute inset-0 h-full w-full object-cover object-[60%_30%]"
        />
        <div className="catalog-hero-shade absolute inset-0" />
        <div className="relative max-w-[75%] px-6 py-10 sm:max-w-[58%] sm:px-10 sm:py-14">
          <h2 className="catalog-heading">
            {content.title} <em>{content.highlight}</em>
          </h2>
          <p className="mt-4 max-w-xs text-xs leading-5 text-muted-foreground sm:text-sm">
            {content.description}
          </p>
          <Button type="button" className="mt-5" tabIndex={-1} aria-hidden="true">
            {content.buttonLabel}
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {file
          ? `Nova imagem: ${file.name}`
          : imageUrl
            ? "Imagem personalizada em uso"
            : "Imagem padrão em uso"}
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="grid min-w-56 flex-1 gap-2 text-sm font-medium">
          Imagem do banner
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button type="button" disabled={!file || saving || loading} onClick={() => void save()}>
          <ImagePlus /> {saving ? "Salvando..." : "Salvar banner"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!imageUrl || saving || loading}
          onClick={() => void restoreDefault()}
        >
          Restaurar imagem padrão
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WEBP ou AVIF. Até 6 MB.</p>
      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold">Texto do banner</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Limites pensados para manter o título e a descrição legíveis no celular e no computador.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Primeira linha do título
            <Input
              aria-label="Primeira linha do título"
              value={content.title}
              maxLength={HERO_TEXT_LIMITS.title}
              disabled={contentLoading || contentSaving}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  title: event.target.value.slice(0, HERO_TEXT_LIMITS.title),
                }))
              }
            />
            <span className="text-xs font-normal text-muted-foreground">
              {content.title.length}/{HERO_TEXT_LIMITS.title} caracteres
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Destaque do título
            <Input
              aria-label="Destaque do título"
              value={content.highlight}
              maxLength={HERO_TEXT_LIMITS.highlight}
              disabled={contentLoading || contentSaving}
              onChange={(event) =>
                setContent((current) => ({
                  ...current,
                  highlight: event.target.value.slice(0, HERO_TEXT_LIMITS.highlight),
                }))
              }
            />
            <span className="text-xs font-normal text-muted-foreground">
              {content.highlight.length}/{HERO_TEXT_LIMITS.highlight} caracteres
            </span>
          </label>
        </div>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          Descrição curta
          <Textarea
            aria-label="Descrição curta"
            value={content.description}
            maxLength={HERO_TEXT_LIMITS.description}
            rows={3}
            disabled={contentLoading || contentSaving}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                description: event.target.value.slice(0, HERO_TEXT_LIMITS.description),
              }))
            }
          />
          <span className="text-xs font-normal text-muted-foreground">
            {content.description.length}/{HERO_TEXT_LIMITS.description} caracteres
          </span>
        </label>
        <label className="mt-4 grid gap-2 text-sm font-medium">
          Texto do botão
          <Input
            aria-label="Texto do botão"
            value={content.buttonLabel}
            maxLength={HERO_TEXT_LIMITS.buttonLabel}
            disabled={contentLoading || contentSaving}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                buttonLabel: event.target.value.slice(0, HERO_TEXT_LIMITS.buttonLabel),
              }))
            }
          />
          <span className="text-xs font-normal text-muted-foreground">
            {content.buttonLabel.length}/{HERO_TEXT_LIMITS.buttonLabel} caracteres
          </span>
        </label>
        <Button
          type="button"
          className="mt-4"
          disabled={contentLoading || contentSaving}
          onClick={() => void saveText()}
        >
          {contentSaving ? "Salvando..." : "Salvar texto"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-primary">
          {notice}
        </p>
      )}
    </section>
  );
}
