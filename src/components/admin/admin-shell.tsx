import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { ArrowLeft, Boxes, ExternalLink, LogOut, Menu, Package, Plus, X } from "lucide-react";

import brandLogo from "@/assets/diva-ativa-logo.png";
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
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProduct,
  ProductInput,
} from "@/lib/catalog-types";

type AdminView = "products" | "categories" | "editor";

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
  const [view, setView] = useState<AdminView>("products");
  const [editingProduct, setEditingProduct] = useState<CatalogProduct>();
  const [formDirty, setFormDirty] = useState(false);
  const [pendingView, setPendingView] = useState<AdminView>();
  const [pendingNewProduct, setPendingNewProduct] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function navigate(nextView: AdminView) {
    setMobileMenuOpen(false);
    if (view === "editor" && formDirty) {
      setPendingView(nextView);
      return;
    }
    setView(nextView);
    setEditingProduct(undefined);
    setFormDirty(false);
  }

  function openEditor(product?: CatalogProduct) {
    if (view === "editor" && formDirty) {
      setPendingNewProduct(true);
      return;
    }
    setEditingProduct(product);
    setFormDirty(false);
    setView("editor");
    setMobileMenuOpen(false);
  }

  const navButtonClass = "w-full justify-start gap-3 px-3 text-sm font-medium";

  return (
    <div className="admin-layout min-h-screen lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r px-4 pb-5 pt-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-start justify-between">
          <img src={brandLogo} alt="Diva Ativa" className="h-[86px] w-[144px] object-contain" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X />
          </Button>
        </div>
        <nav aria-label="Administração" className="grid gap-1">
          <Button
            type="button"
            variant="ghost"
            className={`${navButtonClass} ${view === "products" || view === "editor" ? "admin-nav-active" : ""}`}
            aria-current={view === "products" || view === "editor" ? "page" : undefined}
            onClick={() => navigate("products")}
          >
            <Package /> Produtos
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`${navButtonClass} ${view === "categories" ? "admin-nav-active" : ""}`}
            aria-current={view === "categories" ? "page" : undefined}
            onClick={() => navigate("categories")}
          >
            <Boxes /> Categorias
          </Button>
          <div className="my-3 border-t" />
          <Button asChild variant="ghost" className={navButtonClass}>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Ver catálogo
            </a>
          </Button>
        </nav>
        <div className="mt-auto border-t pt-4">
          <p className="mb-2 truncate px-3 text-xs text-muted-foreground">{user.email}</p>
          <Button type="button" variant="ghost" className={navButtonClass} onClick={onSignOut}>
            <LogOut /> Sair
          </Button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-overlay lg:hidden"
          aria-label="Fechar navegação"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="min-w-0 px-4 pb-12 pt-4 sm:px-7 lg:px-9 lg:pt-8">
        <div className="mx-auto max-w-[1260px]">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu />
            </Button>
            <img src={brandLogo} alt="Diva Ativa" className="h-14 w-24 object-contain" />
            <Button
              type="button"
              size="icon"
              aria-label="Adicionar produto"
              onClick={() => openEditor()}
            >
              <Plus />
            </Button>
          </div>

          {view === "products" && (
            <section className="admin-panel rounded-xl border bg-background p-4 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-3xl text-foreground sm:text-4xl">Produtos</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gerencie as peças disponíveis no catálogo da Diva Ativa.
                  </p>
                </div>
                <Button
                  type="button"
                  className="hidden sm:inline-flex"
                  onClick={() => openEditor()}
                >
                  <Plus /> Novo produto
                </Button>
              </div>
              {loading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Carregando produtos...
                </p>
              ) : (
                <ProductTable
                  products={[...products, ...archivedProducts]}
                  categories={categories}
                  mode="all"
                  onEdit={openEditor}
                  onArchive={onArchiveProduct}
                  onRestore={onRestoreProduct}
                  onDelete={onDeleteProduct}
                />
              )}
            </section>
          )}

          {view === "categories" && (
            <CategoryManager
              categories={categories}
              products={[...products, ...archivedProducts]}
              onCreate={onCreateCategory}
              onUpdate={onUpdateCategory}
              onDelete={onDeleteCategory}
            />
          )}

          {view === "editor" && (
            <section className="admin-panel rounded-xl border bg-background p-4 shadow-sm sm:p-7">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-3 -ml-2"
                    onClick={() => navigate("products")}
                  >
                    <ArrowLeft /> Voltar para produtos
                  </Button>
                  <h1 className="font-display text-3xl sm:text-4xl">
                    {editingProduct ? "Editar produto" : "Novo produto"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Atualize as informações exibidas no catálogo.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Ver no catálogo público
                  </a>
                </Button>
              </div>
              <ProductForm
                key={editingProduct?.id ?? "new-product"}
                {...(editingProduct ? { product: editingProduct } : {})}
                categories={categories}
                onCreateCategory={onCreateCategory}
                onDirtyChange={setFormDirty}
                embedded
                onSave={async (input, files, removedImages, orderedImages) => {
                  await onSaveProduct(editingProduct, input, files, removedImages, orderedImages);
                  setFormDirty(false);
                  setEditingProduct(undefined);
                  setView("products");
                }}
                onCancel={() => navigate("products")}
              />
            </section>
          )}
        </div>
      </main>

      <AlertDialog
        open={Boolean(pendingView) || pendingNewProduct}
        onOpenChange={(open) => {
          if (!open) {
            setPendingView(undefined);
            setPendingNewProduct(false);
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl sm:w-full">
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
              onClick={() => {
                setView(pendingNewProduct ? "editor" : (pendingView ?? "products"));
                setEditingProduct(undefined);
                setFormDirty(false);
                setPendingView(undefined);
                setPendingNewProduct(false);
              }}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
