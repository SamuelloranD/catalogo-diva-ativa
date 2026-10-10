import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CircleArrowLeft } from "lucide-react";

import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import type { ProductImageItem } from "@/components/admin/product-image-uploader";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import {
  archiveProduct,
  createCategory,
  deleteCategory,
  deleteProduct,
  createProduct,
  deleteProductImage,
  listCategories,
  listProducts,
  reorderProductImages,
  restoreProduct,
  updateCategory,
  updateProduct,
  uploadProductImage,
} from "@/lib/catalog-api";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogProduct,
  ProductInput,
} from "@/lib/catalog-types";
import { getAdminSession, signInAdmin, signOutAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({ component: Admin });

export function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [archivedProducts, setArchivedProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    getAdminSession()
      .then(setSession)
      .finally(() => setLoading(false));

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    }).data.subscription;

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    setCatalogLoading(true);
    Promise.all([listProducts(), listProducts({ active: false }), listCategories()])
      .then(([nextProducts, nextArchivedProducts, nextCategories]) => {
        setProducts(nextProducts);
        setArchivedProducts(nextArchivedProducts);
        setCategories(nextCategories);
      })
      .finally(() => setCatalogLoading(false));
  }, [session]);

  async function handleLogin(email: string, password: string) {
    setSession(await signInAdmin(email, password));
  }

  async function handleSignOut() {
    await signOutAdmin();
    setSession(null);
  }

  async function refreshCatalog() {
    const [nextProducts, nextArchivedProducts, nextCategories] = await Promise.all([
      listProducts(),
      listProducts({ active: false }),
      listCategories(),
    ]);
    setProducts(nextProducts);
    setArchivedProducts(nextArchivedProducts);
    setCategories(nextCategories);
  }

  async function handleCreateCategory(name: string): Promise<CatalogCategory> {
    const createdCategory = await createCategory(name);
    await refreshCatalog();
    return createdCategory;
  }

  async function handleUpdateCategory(id: string, name: string) {
    await updateCategory(id, name);
    await refreshCatalog();
  }

  async function handleDeleteCategory(category: CatalogCategory) {
    const linkedProducts = [...products, ...archivedProducts].filter(
      (product) => product.categoryId === category.id,
    );
    for (const product of linkedProducts) {
      await deleteProduct(product);
    }
    await deleteCategory(category.id);
    await refreshCatalog();
  }

  async function handleSaveProduct(
    product: CatalogProduct | undefined,
    input: ProductInput,
    _files: File[],
    removedImages: CatalogImage[],
    orderedImages: ProductImageItem[],
  ) {
    const productId = product
      ? (await updateProduct(product.id, input), product.id)
      : await createProduct(input);

    for (const image of removedImages) {
      await deleteProductImage(image);
    }

    for (const [position, item] of orderedImages.entries()) {
      if (item.kind === "new") {
        await uploadProductImage(productId, item.file, position);
      }
    }

    await reorderProductImages(
      orderedImages.flatMap((item, position) =>
        item.kind === "existing" ? [{ ...item.image, position }] : [],
      ),
    );

    await refreshCatalog();
  }

  async function handleArchiveProduct(product: CatalogProduct) {
    await archiveProduct(product.id);
    await refreshCatalog();
  }

  async function handleRestoreProduct(product: CatalogProduct) {
    await restoreProduct(product.id);
    await refreshCatalog();
  }

  async function handleDeleteProduct(product: CatalogProduct) {
    await deleteProduct(product);
    await refreshCatalog();
  }

  return (
    <>
      <SiteNavbar
        leadingAction={
          <Button asChild variant="navbar" size="navbarIconLarge" title="Voltar ao catálogo">
            <a href="/" aria-label="Voltar ao catálogo">
              <CircleArrowLeft />
            </a>
          </Button>
        }
      />
      <main className="min-h-screen bg-secondary/30 py-12">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-14">
          <h1 className="sr-only">Administração do catálogo</h1>
          {!isSupabaseConfigured() ? (
            <div className="mx-auto max-w-xl rounded-2xl border bg-background p-8 text-center shadow-sm">
              <h2 className="font-display text-4xl">Administração do catálogo</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Configure o Supabase com as variáveis do arquivo `.env` para ativar o acesso
                administrativo.
              </p>
            </div>
          ) : loading ? (
            <p className="text-center text-sm text-muted-foreground">Carregando sessão...</p>
          ) : session ? (
            <AdminShell
              user={session.user}
              products={products}
              archivedProducts={archivedProducts}
              categories={categories}
              loading={catalogLoading}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onSaveProduct={handleSaveProduct}
              onArchiveProduct={handleArchiveProduct}
              onRestoreProduct={handleRestoreProduct}
              onDeleteProduct={handleDeleteProduct}
              onSignOut={handleSignOut}
            />
          ) : (
            <AdminLogin onSubmit={handleLogin} />
          )}
        </div>
      </main>
    </>
  );
}
