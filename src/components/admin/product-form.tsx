import { useMemo, useState, type FormEvent } from "react";

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
  removeCatalogPriceDigit,
} from "@/lib/catalog";
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
};

export function ProductForm({
  product,
  categories,
  onCreateCategory,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "Diva Ativa");
  const [description, setDescription] = useState(product?.description ?? "");
  const [colorLabel, setColorLabel] = useState(product?.color ?? "Cores disponíveis");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [priceCents, setPriceCents] = useState(
    product?.price === undefined ? 0 : Math.round(product.price * 100),
  );
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
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  async function handleCreateCategory() {
    if (!onCreateCategory || !newCategoryName.trim()) return;

    setAddingCategory(true);
    setCategoryError("");
    try {
      const createdCategory = await onCreateCategory(newCategoryName.trim());
      setCategoryId(createdCategory.id);
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
          brand,
          description,
          colorLabel,
          tag,
          price: priceCents > 0 ? priceCents / 100 : undefined,
          active: true,
        },
        files,
        removedImages,
        imageItems,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border bg-background p-5">
      <div>
        <h3 className="font-medium">{product ? "Editar produto" : "Novo produto"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados exibidos no catálogo.
        </p>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Nome da peça
        <Input
          aria-label="Nome da peça"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <div className="grid gap-2 text-sm font-medium">
        <span>Categoria</span>
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.length > 0 ? (
            <CatalogDropdown
              label="Categoria"
              value={categoryId}
              options={categoryOptions}
              onValueChange={setCategoryId}
              placeholder="Selecione a categoria"
              showLabel={false}
              compact
              className="w-full min-w-0 max-w-sm sm:w-64"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Crie uma categoria antes de cadastrar produtos.
            </p>
          )}
          {onCreateCategory && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs"
              onClick={() => {
                setCategoryError("");
                setShowNewCategory((open) => !open);
              }}
            >
              + Nova categoria
            </Button>
          )}
        </div>
        {showNewCategory && onCreateCategory && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Nome da nova categoria"
              className="w-full max-w-sm"
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Marca
          <Input value={brand} onChange={(event) => setBrand(event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Tag
          <Input
            placeholder="Ex.: NOVO"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Valor (BRL)
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            R$
          </span>
          <Input
            aria-label="Valor (BRL)"
            className="pl-10"
            inputMode="numeric"
            readOnly
            value={formatCatalogPriceInput(priceCents)}
            onKeyDown={(event) => {
              if (/^\d$/.test(event.key)) {
                event.preventDefault();
                setPriceCents((current) => appendCatalogPriceDigit(current, Number(event.key)));
              } else if (event.key === "Backspace" || event.key === "Delete") {
                event.preventDefault();
                setPriceCents(removeCatalogPriceDigit);
              }
            }}
          />
        </div>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Texto de cor
        <Input value={colorLabel} onChange={(event) => setColorLabel(event.target.value)} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Descrição
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </label>
      <div className="grid gap-2 text-sm font-medium">
        Fotos do produto
        <ProductImageUploader items={imageItems} onItemsChange={setImageItems} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || categoryOptions.length === 0}>
          {saving ? "Salvando..." : "Salvar produto"}
        </Button>
      </div>
    </form>
  );
}
