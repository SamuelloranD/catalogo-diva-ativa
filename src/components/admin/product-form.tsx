import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { CatalogDropdown } from "@/components/ui/catalog-dropdown";
import { Button } from "@/components/ui/button";
import {
  ProductImageUploader,
  type ProductImageItem,
} from "@/components/admin/product-image-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  appendCatalogPriceDigit,
  formatCatalogPriceInput,
  isAccessoryCategory,
  removeCatalogPriceDigit,
} from "@/lib/catalog";
import { CATALOG_SIZE_OPTIONS } from "@/lib/catalog-types";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProduct,
  ProductInput,
} from "@/lib/catalog-types";

type ProductFormProps = {
  product?: CatalogProduct;
  categories: CatalogCategory[];
  onCreateCategory?: (name: string) => Promise<CatalogCategory>;
  onSave: (
    input: ProductInput,
    files: File[],
    removedImages: CatalogImage[],
    orderedImages: ProductImageItem[],
  ) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  showCloseButton?: boolean;
  embedded?: boolean;
};

function productSaveErrorMessage(reason: unknown) {
  if (reason && typeof reason === "object" && "message" in reason) {
    const message = reason.message;
    if (typeof message === "string") {
      const code = "code" in reason ? reason.code : undefined;
      if (
        (code === "PGRST204" || code === "PGRST205" || code === "42703" || code === "42P01") &&
        /sizes|colors|product_categories/i.test(message)
      ) {
        return "O Supabase ainda não reconhece os campos de tamanhos, cores ou categorias adicionais. Aplique a migração 20261014_product_variations.sql e atualize o cache do esquema.";
      }
      return message;
    }
  }
  return "Não foi possível salvar o produto.";
}

export function ProductForm({
  product,
  categories,
  onCreateCategory,
  onSave,
  onCancel,
  onDirtyChange,
  showCloseButton = false,
  embedded = false,
}: ProductFormProps) {
  const initialName = product?.name ?? "";
  const initialCategoryId = product?.categoryId ?? "";
  const initialCategoryIds =
    product?.categoryIds ?? (product?.categoryId ? [product.categoryId] : []);
  const initialSizes =
    product?.sizes ??
    (product
      ? isAccessoryCategory(product.category)
        ? []
        : ["P", "M", "G", "GG"]
      : ["P", "M", "G", "G1", "G2"]);
  const initialColors = (product?.colors ?? []).map((color) => ({
    ...color,
    sizes: color.sizes ?? initialSizes,
  }));
  const initialBrand = product?.brand ?? "Diva Ativa";
  const initialDescription = product?.description ?? "";
  const initialColorLabel = product?.color ?? "Cores disponíveis";
  const initialTag = product?.tag ?? "";
  const initialPriceCents = product?.price === undefined ? 0 : Math.round(product.price * 100);
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategoryIds);
  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [colors, setColors] = useState(initialColors);
  const sizeOptions = [
    ...new Set([
      ...CATALOG_SIZE_OPTIONS,
      ...sizes,
      ...colors.flatMap((color) => color.sizes ?? []),
    ]),
  ];
  const [brand, setBrand] = useState(initialBrand);
  const [description, setDescription] = useState(initialDescription);
  const [colorLabel, setColorLabel] = useState(initialColorLabel);
  const [tag, setTag] = useState(initialTag);
  const [priceCents, setPriceCents] = useState(initialPriceCents);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const originalImages = product?.imageRecords ?? [];
  const [imageItems, setImageItems] = useState<ProductImageItem[]>(() =>
    originalImages.map((image) => ({ kind: "existing", image })),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<"general" | "variations" | "photos">("general");
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );
  const imagesChanged =
    imageItems.length !== originalImages.length ||
    imageItems.some(
      (item, index) => item.kind !== "existing" || item.image.id !== originalImages[index]?.id,
    );
  const isDirty =
    name !== initialName ||
    categoryId !== initialCategoryId ||
    JSON.stringify(categoryIds) !== JSON.stringify(initialCategoryIds) ||
    JSON.stringify(sizes) !== JSON.stringify(initialSizes) ||
    JSON.stringify(colors) !== JSON.stringify(initialColors) ||
    brand !== initialBrand ||
    description !== initialDescription ||
    colorLabel !== initialColorLabel ||
    tag !== initialTag ||
    priceCents !== initialPriceCents ||
    newCategoryName.trim().length > 0 ||
    imagesChanged;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function handleCreateCategory() {
    if (!onCreateCategory || !newCategoryName.trim()) return;

    setAddingCategory(true);
    setCategoryError("");
    try {
      const createdCategory = await onCreateCategory(newCategoryName.trim());
      setCategoryId(createdCategory.id);
      setCategoryIds((current) => [...new Set([...current, createdCategory.id])]);
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (reason) {
      setCategoryError(
        reason instanceof Error ? reason.message : "Não foi possível criar a categoria.",
      );
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Escolha uma categoria.");
      return;
    }

    const savedColors = colors
      .filter((color) => color.name.trim())
      .map((color) => ({
        name: color.name.trim(),
        ...(color.hex ? { hex: color.hex } : {}),
        sizes: color.sizes ?? [],
      }));
    if (colors.some((color) => !color.name.trim() && (color.sizes?.length ?? 0) > 0)) {
      setError("Informe o nome da cor antes de selecionar os tamanhos.");
      return;
    }
    const colorNames = savedColors.map((color) => color.name.toLocaleLowerCase("pt-BR"));
    if (new Set(colorNames).size !== colorNames.length) {
      setError("Cada cor precisa ter um nome diferente.");
      return;
    }
    const selectedCategory = categories.find((category) => category.id === categoryId)?.name ?? "";
    if (
      savedColors.length > 0 &&
      !isAccessoryCategory(selectedCategory) &&
      savedColors.some((color) => color.sizes.length === 0)
    ) {
      setError("Selecione ao menos um tamanho para cada cor.");
      return;
    }
    const savedSizes = savedColors.length
      ? sizeOptions.filter((option) => savedColors.some((color) => color.sizes.includes(option)))
      : sizes;

    setSaving(true);
    setError("");
    try {
      const removedImages = originalImages.filter(
        (image) =>
          !imageItems.some((item) => item.kind === "existing" && item.image.id === image.id),
      );
      const files = imageItems
        .filter((item): item is Extract<ProductImageItem, { kind: "new" }> => item.kind === "new")
        .map((item) => item.file);

      await onSave(
        {
          name,
          categoryId,
          categoryIds: [...new Set([categoryId, ...categoryIds])],
          sizes: savedSizes,
          colors: savedColors,
          brand,
          description,
          colorLabel,
          tag,
          ...(priceCents > 0 ? { price: priceCents / 100 } : {}),
          active: true,
        },
        files,
        removedImages,
        imageItems,
      );
    } catch (reason) {
      setError(productSaveErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-4 ${embedded ? "" : "rounded-xl border bg-background p-5"}`}
    >
      {showCloseButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Fechar formulário"
          className="justify-self-end"
          onClick={onCancel}
        >
          <X />
        </Button>
      )}
      <div
        className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 lg:hidden"
        aria-label="Seções do produto"
      >
        {(
          [
            ["general", "Geral"],
            ["variations", "Variações"],
            ["photos", "Fotos"],
          ] as const
        ).map(([tab, label]) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={mobileTab === tab ? "outline" : "ghost"}
            className="px-2"
            aria-pressed={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div
          className={`grid content-start gap-4 ${mobileTab === "general" ? "" : "hidden lg:grid"}`}
        >
          <section className="admin-editor-card grid gap-4 rounded-lg border p-4 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold">Informações gerais</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Dados principais exibidos no catálogo.
              </p>
            </div>
            <label className="grid gap-2 text-xs font-medium">
              Nome da peça
              <Input
                aria-label="Nome da peça"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-medium">
                Marca
                <Input value={brand} onChange={(event) => setBrand(event.target.value)} />
              </label>
              <label className="grid gap-2 text-xs font-medium">
                Tag
                <Input
                  placeholder="Ex.: NOVO"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                />
              </label>
            </div>
            <label className="grid gap-2 text-xs font-medium">
              Preço (BRL)
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  aria-label="Valor (BRL)"
                  className="pl-10"
                  inputMode="numeric"
                  value={formatCatalogPriceInput(priceCents)}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    setPriceCents(digits ? Number(digits) : 0);
                  }}
                  onKeyDown={(event) => {
                    if (/^\d$/.test(event.key)) {
                      event.preventDefault();
                      setPriceCents((current) =>
                        appendCatalogPriceDigit(current, Number(event.key)),
                      );
                    } else if (event.key === "Backspace" || event.key === "Delete") {
                      event.preventDefault();
                      setPriceCents(removeCatalogPriceDigit);
                    }
                  }}
                />
              </div>
            </label>
            <label className="grid gap-2 text-xs font-medium">
              Descrição
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </label>
          </section>

          <section className="admin-editor-card grid gap-4 rounded-lg border p-4 sm:p-5">
            <div>
              <h2 className="text-sm font-semibold">Categorias</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Escolha onde a peça aparecerá no catálogo.
              </p>
            </div>
            <div className="grid gap-2 text-xs font-medium">
              <span>
                Categoria principal{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </span>
              {categoryOptions.length > 0 ? (
                <CatalogDropdown
                  label="Categoria"
                  value={categoryId}
                  options={categoryOptions}
                  onValueChange={(id) => {
                    setCategoryId(id);
                    setCategoryIds((current) => [...new Set([...current, id])]);
                  }}
                  placeholder="Selecione a categoria"
                  showLabel={false}
                  compact
                  className="w-full min-w-0"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Crie uma categoria antes de cadastrar produtos.
                </p>
              )}
            </div>
            {categoryOptions.length > 0 && (
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-xs font-medium">Demais categorias</legend>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions
                    .filter((option) => option.value !== categoryId)
                    .map((option) => (
                      <label key={option.value} className="admin-choice-chip cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryIds.includes(option.value)}
                          onChange={(event) =>
                            setCategoryIds((current) =>
                              event.target.checked
                                ? [...current, option.value]
                                : current.filter((id) => id !== option.value),
                            )
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                </div>
              </fieldset>
            )}
            {onCreateCategory && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto w-fit px-0 text-xs"
                onClick={() => {
                  setCategoryError("");
                  setShowNewCategory((open) => !open);
                }}
              >
                + Nova categoria
              </Button>
            )}
            {showNewCategory && onCreateCategory && (
              <div className="flex flex-wrap gap-2">
                <Input
                  aria-label="Nome da nova categoria"
                  className="min-w-40 flex-1"
                  placeholder="Ex.: Saias"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={addingCategory || !newCategoryName.trim()}
                  onClick={() => void handleCreateCategory()}
                >
                  {addingCategory ? "Adicionando..." : "Adicionar categoria"}
                </Button>
              </div>
            )}
            {categoryError && (
              <p role="alert" className="text-sm text-destructive">
                {categoryError}
              </p>
            )}
          </section>
        </div>

        <div className="grid content-start gap-4">
          <section
            className={`admin-editor-card grid gap-4 rounded-lg border p-4 sm:p-5 ${mobileTab === "variations" ? "" : "hidden lg:grid"}`}
          >
            <div>
              <h2 className="text-sm font-semibold">Tamanhos disponíveis</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {colors.length
                  ? "Defina os tamanhos de cada cor abaixo."
                  : "Selecione os tamanhos deste produto."}
              </p>
            </div>
            {colors.length === 0 && (
              <fieldset>
                <legend className="sr-only">Tamanhos deste produto</legend>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((option) => (
                    <label key={option} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={sizes.includes(option)}
                        onChange={(event) =>
                          setSizes((current) =>
                            event.target.checked
                              ? [...current, option]
                              : current.filter((value) => value !== option),
                          )
                        }
                        aria-label={option}
                      />
                      <span className="inline-flex h-9 min-w-10 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {colors.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Deixe todos desmarcados para peças sem tamanho.
              </p>
            )}
          </section>

          <section
            className={`admin-editor-card grid gap-3 rounded-lg border p-4 sm:p-5 ${mobileTab === "variations" ? "" : "hidden lg:grid"}`}
          >
            <div>
              <h2 className="text-sm font-semibold">Cores (opcional)</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione as cores disponíveis para este produto.
              </p>
            </div>
            {colors.map((color, index) => (
              <div key={index} className="grid gap-3 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    aria-label={`Código hexadecimal da cor ${index + 1}`}
                    type="color"
                    className="h-8 w-9 shrink-0 border-0 p-0"
                    value={color.hex ?? "#607354"}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, position) =>
                          position === index ? { ...item, hex: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label={`Nome da cor ${index + 1}`}
                    placeholder="Nome da cor"
                    value={color.name}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, position) =>
                          position === index ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover cor ${index + 1}`}
                    onClick={() =>
                      setColors((current) => current.filter((_, position) => position !== index))
                    }
                  >
                    <X />
                  </Button>
                </div>
                <fieldset>
                  <legend className="mb-2 text-xs font-medium">Tamanhos desta cor</legend>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((option) => (
                      <label key={option} className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          aria-label={`Tamanho ${option} da cor ${color.name.trim() || index + 1}`}
                          checked={color.sizes?.includes(option) ?? false}
                          onChange={(event) =>
                            setColors((current) =>
                              current.map((item, position) =>
                                position === index
                                  ? {
                                      ...item,
                                      sizes: event.target.checked
                                        ? [...(item.sizes ?? []), option]
                                        : (item.sizes ?? []).filter((value) => value !== option),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                        <span className="inline-flex h-9 min-w-10 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setColors((current) => [...current, { name: "", sizes: [] }])}
            >
              + Adicionar cor
            </Button>
            <label className="grid gap-2 text-xs font-medium">
              Texto de cor
              <Input value={colorLabel} onChange={(event) => setColorLabel(event.target.value)} />
            </label>
          </section>

          <section
            className={`admin-editor-card grid gap-3 rounded-lg border p-4 sm:p-5 ${mobileTab === "photos" ? "" : "hidden lg:grid"}`}
          >
            <div>
              <h2 className="text-sm font-semibold">Fotos do produto</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione e organize as fotos. A primeira será a capa.
              </p>
            </div>
            <ProductImageUploader items={imageItems} onItemsChange={setImageItems} />
          </section>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="admin-editor-actions sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || categoryOptions.length === 0}>
          {saving ? "Salvando..." : product ? "Salvar alterações" : "Salvar produto"}
        </Button>
      </div>
    </form>
  );
}
