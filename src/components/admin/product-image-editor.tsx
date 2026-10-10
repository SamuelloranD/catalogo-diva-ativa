import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const OUTPUT_WIDTH = 900;
const OUTPUT_HEIGHT = 1200;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type ProductImageEditorProps = {
  open: boolean;
  imageUrl: string;
  imageName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (file: File) => void;
};

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function fileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "imagem";
}

export function ProductImageEditor({
  open,
  imageUrl,
  imageName,
  onOpenChange,
  onSave,
}: ProductImageEditorProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; origin: Point }>();
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
  const [previewSize, setPreviewSize] = useState<Size>({ width: 320, height: 426.67 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setImageSize({ width: 0, height: 0 });
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setError("");
    setSaving(false);
  }, [imageUrl, open]);

  useEffect(() => {
    if (!open || !previewRef.current) return;

    const updatePreviewSize = () => {
      const bounds = previewRef.current?.getBoundingClientRect();
      if (!bounds?.width) return;

      setPreviewSize({ width: bounds.width, height: bounds.height });
    };

    updatePreviewSize();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updatePreviewSize);
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [open]);

  const baseScale =
    imageSize.width && imageSize.height
      ? Math.max(previewSize.width / imageSize.width, previewSize.height / imageSize.height)
      : 1;
  const renderedSize = {
    width: imageSize.width * baseScale * zoom,
    height: imageSize.height * baseScale * zoom,
  };

  function constrainOffset(nextOffset: Point, nextZoom = zoom) {
    const nextScale = baseScale * nextZoom;
    const maxX = Math.max(0, (imageSize.width * nextScale - previewSize.width) / 2);
    const maxY = Math.max(0, (imageSize.height * nextScale - previewSize.height) / 2);

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    };
  }

  function handleZoomChange(nextZoom: number) {
    const safeZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setZoom(safeZoom);
    setOffset((currentOffset) => constrainOffset(currentOffset, safeZoom));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageSize.width || !imageSize.height) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setOffset(
      constrainOffset({
        x: drag.origin.x + event.clientX - drag.start.x,
        y: drag.origin.y + event.clientY - drag.start.y,
      }),
    );
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = undefined;
  }

  async function handleSave() {
    const image = imageRef.current;
    if (!image || !imageSize.width || !imageSize.height) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Não foi possível preparar o ajuste da imagem.");
      return;
    }

    setSaving(true);
    setError("");
    const scale = baseScale * zoom;
    const sourceWidth = previewSize.width / scale;
    const sourceHeight = previewSize.height / scale;
    const sourceX = clamp(
      (imageSize.width - sourceWidth) / 2 - offset.x / scale,
      0,
      imageSize.width - sourceWidth,
    );
    const sourceY = clamp(
      (imageSize.height - sourceHeight) / 2 - offset.y / scale,
      0,
      imageSize.height - sourceHeight,
    );

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setError("Não foi possível gerar a imagem ajustada.");
      setSaving(false);
      return;
    }

    onSave(
      new File([blob], `${fileNameWithoutExtension(imageName)}-ajustada.jpg`, {
        type: "image/jpeg",
      }),
    );
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel="Fechar ajuste de imagem"
        className="w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-4 sm:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
          <div className="grid gap-3">
            <div>
              <DialogTitle>Ajustar imagem</DialogTitle>
              <DialogDescription className="mt-2">
                Arraste para reposicionar e use o zoom para escolher o melhor enquadramento.
              </DialogDescription>
            </div>
            <div
              ref={previewRef}
              className="relative mx-auto aspect-[3/4] w-full max-w-[320px] touch-none overflow-hidden rounded-xl bg-secondary shadow-inner ring-1 ring-border"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              role="application"
              aria-label="Prévia do enquadramento da imagem"
            >
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={imageName}
                  crossOrigin="anonymous"
                  draggable={false}
                  onLoad={(event) => {
                    setImageSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    });
                  }}
                  onError={() => setError("Não foi possível carregar esta imagem para ajuste.")}
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: renderedSize.width,
                    height: renderedSize.height,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  }}
                />
              )}
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-background/60" />
              {!imageSize.width && (
                <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  Carregando prévia...
                </span>
              )}
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-xl border bg-secondary/30 p-3">
              <div className="mb-2 flex items-center justify-between text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  <ZoomIn className="size-4 text-primary" />
                  Zoom
                </span>
                <span className="text-muted-foreground">{zoom.toFixed(1)}×</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Reduzir zoom"
                  onClick={() => handleZoomChange(zoom - 0.1)}
                  disabled={zoom <= MIN_ZOOM}
                >
                  <Minus />
                </Button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step="0.1"
                  value={zoom}
                  aria-label="Zoom da imagem"
                  onChange={(event) => handleZoomChange(Number(event.target.value))}
                  className="min-w-0 flex-1 accent-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Aumentar zoom"
                  onClick={() => handleZoomChange(zoom + 0.1)}
                  disabled={zoom >= MAX_ZOOM}
                >
                  <Plus />
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => {
                setZoom(MIN_ZOOM);
                setOffset({ x: 0, y: 0 });
              }}
            >
              <RotateCcw />
              Restaurar enquadramento
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={!imageSize.width || saving}>
                {saving ? "Preparando..." : "Salvar ajuste"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
