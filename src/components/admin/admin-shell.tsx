import type { User } from "@supabase/supabase-js";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CategoryManager } from "@/components/admin/category-manager";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductImageItem } from "@/components/admin/product-image-uploader";
import { ProductTable } from "@/components/admin/product-table";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProduct,
  ProductInput,
} from "@/lib/catalog-types";

type AdminShellProps = {
  user: User;
  products: CatalogProduct[];
  archivedProducts: CatalogProduct[];
  categories: CatalogCategory[];
  loading: boolean;
  onCreateCategory: (name: string) => Promise<CatalogCategory>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (category: CatalogCategory) => Promise<void>;
  onSaveProduct: (
    product: CatalogProduct | undefined,
    input: ProductInput,
    files: File[],
    removedImages: CatalogImage[],
    orderedImages: ProductImageItem[],
  ) => Promise<void>;
  onArchiveProduct: (product: CatalogProduct) => Promise<void>;
  onRestoreProduct: (product: CatalogProduct) => Promise<void>;
  onDeleteProduct: (product: CatalogProduct) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AdminShell({
  user,
  products,
  archivedProducts,
  categories,
  loading,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSaveProduct,
  onArchiveProduct,
  onRestoreProduct,
  onDeleteProduct,
  onSignOut,
}: AdminShellProps) {
  const [editingProduct, setEditingProduct] = useState<CatalogProduct>();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:px-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Diva Ativa · Administração
          </p>
          <h2 className="mt-2 font-display text-4xl">Seu catálogo sempre atualizado.</h2>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={onSignOut}>
          Sair
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            setEditingProduct(undefined);
            setFormOpen(true);
          }}
        >
          Novo produto
        </Button>
      </div>
      {formOpen &&
        (editingProduct ? (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onCreateCategory={onCreateCategory}
            onSave={(input, files, removedImages, orderedImages) =>
              onSaveProduct(editingProduct, input, files, removedImages, orderedImages).then(() =>
                setFormOpen(false),
              )
            }
            onCancel={() => {
              setEditingProduct(undefined);
              setFormOpen(false);
            }}
          />
        ) : (
          <ProductForm
            categories={categories}
            onCreateCategory={onCreateCategory}
            onSave={(input, files, removedImages, orderedImages) =>
              onSaveProduct(undefined, input, files, removedImages, orderedImages).then(() =>
                setFormOpen(false),
              )
            }
            onCancel={() => setFormOpen(false)}
          />
        ))}
      {!formOpen && (
        <CategoryManager
          categories={categories}
          products={[...products, ...archivedProducts]}
          onCreate={onCreateCategory}
          onUpdate={onUpdateCategory}
          onDelete={onDeleteCategory}
        />
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando produtos...</p>
      ) : (
        <ProductTable
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setFormOpen(true);
          }}
          onArchive={onArchiveProduct}
        />
      )}
      {!loading && (
        <ProductTable
          products={archivedProducts}
          mode="archived"
          onRestore={onRestoreProduct}
          onDelete={onDeleteProduct}
        />
      )}
    </section>
  );
}
