import { useEffect, useId, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Crop, Trash2 } from "lucide-react";

import { ProductImageEditor } from "@/components/admin/product-image-editor";
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
  const [editingImage, setEditingImage] = useState<{
    key: string;
    label: string;
    url: string;
  }>();
  const fileInputId = useId();
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

  function saveEditedImage(file: File) {
    if (!editingImage) return;

    onItemsChange(
      items.map((item) => {
        const itemKey = item.kind === "existing" ? item.image.id : item.clientId;
        if (itemKey !== editingImage.key) return item;

        return {
          kind: "new",
          file,
          clientId: item.kind === "new" ? item.clientId : `edited-${item.image.id}`,
        };
      }),
    );
    setEditingImage(undefined);
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 text-sm font-medium">
        <span>Adicionar fotos</span>
        <Button asChild type="button" variant="outline" className="w-fit">
          <label htmlFor={fileInputId}>Escolher arquivos</label>
        </Button>
        <Input
          id={fileInputId}
          aria-label="Adicionar fotos"
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) => handleFilesChange(Array.from(event.target.files ?? []))}
        />
      </div>
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
            const itemKey = item.kind === "existing" ? item.image.id : item.clientId;

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
                <div className="grid gap-2 p-2">
                  <div className="flex items-center justify-center gap-2">
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title={`Ajustar imagem ${label}`}
                        aria-label={`Ajustar imagem ${label}`}
                        onClick={() => setEditingImage({ key: itemKey, label, url: imageUrl })}
                      >
                        <Crop className="size-5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      aria-label={`Mover imagem ${label} para cima`}
                    >
                      <ArrowLeft className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === items.length - 1}
                      onClick={() => moveImage(index, 1)}
                      aria-label={`Mover imagem ${label} para baixo`}
                    >
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                  <div className="flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={`Remover imagem ${label}`}
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
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ProductImageEditor
        open={Boolean(editingImage)}
        imageUrl={editingImage?.url ?? ""}
        imageName={editingImage?.label ?? "imagem"}
        onOpenChange={(open) => {
          if (!open) setEditingImage(undefined);
        }}
        onSave={saveEditedImage}
      />
    </div>
  );
}
