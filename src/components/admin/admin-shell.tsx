import type { User } from "@supabase/supabase-js";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryManager } from "@/components/admin/category-manager";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductImageItem } from "@/components/admin/product-image-uploader";
import { ProductTable } from "@/components/admin/product-table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
  const [formDirty, setFormDirty] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const closeProductForm = () => {
    setFormOpen(false);
    setEditingProduct(undefined);
    setFormDirty(false);
    setDiscardDialogOpen(false);
  };

  const requestCloseProductForm = () => {
    if (formDirty) {
      setDiscardDialogOpen(true);
      return;
    }

    closeProductForm();
  };

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
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            requestCloseProductForm();
          } else {
            setFormOpen(true);
          }
        }}
      >
        <DialogContent
          overlayClassName="bg-overlay/80 backdrop-blur-sm"
          showClose={false}
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl border bg-background p-0 shadow-xl sm:rounded-2xl"
        >
          <div className="admin-product-modal-scroll max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingProduct ? "Editar produto" : "Novo produto"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preencha os dados exibidos no catálogo.
            </DialogDescription>
            {editingProduct ? (
              <ProductForm
                key={editingProduct.id}
                product={editingProduct}
                categories={categories}
                onCreateCategory={onCreateCategory}
                onDirtyChange={setFormDirty}
                showCloseButton
                embedded
                onSave={(input, files, removedImages, orderedImages) =>
                  onSaveProduct(editingProduct, input, files, removedImages, orderedImages).then(
                    closeProductForm,
                  )
                }
                onCancel={requestCloseProductForm}
              />
            ) : (
              <ProductForm
                key="new-product"
                categories={categories}
                onCreateCategory={onCreateCategory}
                onDirtyChange={setFormDirty}
                showCloseButton
                embedded
                onSave={(input, files, removedImages, orderedImages) =>
                  onSaveProduct(undefined, input, files, removedImages, orderedImages).then(
                    closeProductForm,
                  )
                }
                onCancel={requestCloseProductForm}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              {editingProduct
                ? "As alterações feitas serão perdidas."
                : "Os campos preenchidos serão perdidos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={closeProductForm}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CategoryManager
        categories={categories}
        products={[...products, ...archivedProducts]}
        onCreate={onCreateCategory}
        onUpdate={onUpdateCategory}
        onDelete={onDeleteCategory}
      />
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
