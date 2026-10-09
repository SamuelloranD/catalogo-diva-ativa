import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CatalogImage } from "@/lib/catalog-types";

export const MAX_IMAGE_SIZE = 6 * 1024 * 1024;

export type ProductImageItem =
  { kind: "existing"; image: CatalogImage } | { kind: "new"; file: File; clientId: string };

type ProductImageUploaderProps = {
  items: ProductImageItem[];
  onItemsChange: (items: ProductImageItem[]) => void;
};

export function ProductImageUploader({ items, onItemsChange }: ProductImageUploaderProps) {
  const [error, setError] = useState("");
  const previewUrls = useMemo(() => {
    const urls = new Map<string, string>();

    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      items.forEach((item) => {
        if (item.kind === "new") urls.set(item.clientId, URL.createObjectURL(item.file));
      });
    }

    return urls;
  }, [items]);

  useEffect(
    () => () => {
      if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    },
    [previewUrls],
  );

  function handleFilesChange(files: File[]) {
    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE,
    );
    if (invalid) {
      setError("Escolha apenas imagens de até 6 MB.");
      return;
    }

    setError("");
    const timestamp = Date.now();
    const newItems: ProductImageItem[] = files.map((file, index) => ({
      kind: "new",
      file,
      clientId: `${timestamp}-${index}-${file.name}`,
    }));
    onItemsChange([...items, ...newItems]);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    onItemsChange(nextItems);
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-medium">
        Adicionar fotos
        <Input
          aria-label="Adicionar fotos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) => handleFilesChange(Array.from(event.target.files ?? []))}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, index) => {
            const label = item.kind === "existing" ? item.image.altText : item.file.name;
            const imageUrl =
              item.kind === "existing" ? item.image.url : previewUrls.get(item.clientId);

            return (
              <div
                key={item.kind === "existing" ? item.image.id : item.clientId}
                className="relative overflow-hidden rounded-xl border"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt={label} className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center bg-secondary px-3 text-center text-xs text-muted-foreground">
                    {label}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 p-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    aria-label={`Mover imagem ${label} para cima`}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === items.length - 1}
                    onClick={() => moveImage(index, 1)}
                    aria-label={`Mover imagem ${label} para baixo`}
                  >
                    →
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onItemsChange(
                        items.filter((candidate) =>
                          candidate.kind === "existing"
                            ? item.kind === "existing"
                              ? candidate.image.id !== item.image.id
                              : true
                            : item.kind === "new"
                              ? candidate.clientId !== item.clientId
                              : true,
                        ),
                      )
                    }
                    aria-label={`Remover imagem ${label}`}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
