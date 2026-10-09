import { useEffect, useState } from "react";

import { listCategories, listProducts } from "@/lib/catalog-api";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { CatalogProduct } from "@/lib/catalog-types";

type CatalogDataSource = "local" | "remote";

export function useCatalog(fallbackProducts: CatalogProduct[], fallbackCategories: string[]) {
  const [products, setProducts] = useState(fallbackProducts);
  const [categories, setCategories] = useState(fallbackCategories);
  const [source, setSource] = useState<CatalogDataSource>("local");
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let mounted = true;
    setLoading(true);

    Promise.all([listProducts(), listCategories()])
      .then(([remoteProducts, remoteCategories]) => {
        if (!mounted) return;
        setProducts(remoteProducts);
        setCategories(["Todas as peças", ...remoteCategories.map((category) => category.name)]);
        setSource("remote");
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!mounted) return;
        setError(
          reason instanceof Error ? reason : new Error("Não foi possível carregar o catálogo."),
        );
        setProducts(fallbackProducts);
        setCategories(fallbackCategories);
        setSource("local");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fallbackCategories, fallbackProducts]);

  return { products, categories, source, loading, error };
}
