import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog-types";

type ProductTableProps = {
  products: CatalogProduct[];
  categories?: CatalogCategory[];
  mode?: "all" | "active" | "archived";
  onEdit?: (product: CatalogProduct) => void;
  onArchive?: (product: CatalogProduct) => Promise<void>;
  onRestore?: (product: CatalogProduct) => Promise<void>;
  onDelete?: (product: CatalogProduct) => Promise<void>;
};

const PAGE_SIZE = 6;

function formatPrice(price?: number) {
  return price == null
    ? "Valor sob consulta"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export function ProductTable({
  products,
  categories = [],
  mode = "active",
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const rows = products.filter((product) => {
      const categoryMatches =
        !categoryId || (product.categoryIds ?? [product.categoryId]).includes(categoryId);
      const statusMatches =
        status === "all" ||
        (status === "active" ? product.active !== false : product.active === false);
      return (
        product.name.toLocaleLowerCase("pt-BR").includes(query) && categoryMatches && statusMatches
      );
    });
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "price-low") rows.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-high") rows.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === "recent")
      rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return rows;
  }, [products, search, categoryId, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectableRows = pageRows.filter((product) => product.active !== false);
  const selectedProducts = products.filter(
    (product) => selected.has(product.id) && product.active !== false,
  );
  useEffect(() => setPage(1), [search, categoryId, status, sort]);

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function archiveSelected() {
    if (!onArchive) return;
    setBulkBusy(true);
    setBulkError("");
    try {
      for (const product of selectedProducts) await onArchive(product);
      setSelected(new Set());
    } catch (reason) {
      setBulkError(
        reason instanceof Error ? reason.message : "Não foi possível arquivar os produtos.",
      );
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <section className="min-w-0">
      {mode !== "all" && (
        <div className="mb-4">
          <h3 className="font-display text-3xl">
            {mode === "archived" ? "Produtos arquivados" : "Produtos"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produto" : "produtos"}{" "}
            {mode === "archived"
              ? products.length === 1
                ? "arquivado"
                : "arquivados"
              : products.length === 1
                ? "ativo"
                : "ativos"}
            .
          </p>
        </div>
      )}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <label className="relative sm:col-span-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar produtos"
            placeholder="Buscar produtos por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </label>
        <label className="sr-only" htmlFor="admin-product-category">
          Filtrar por categoria
        </label>
        <select
          id="admin-product-category"
          className="admin-select"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="admin-product-status">
          Filtrar por status
        </label>
        <select
          id="admin-product-status"
          className="admin-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="archived">Arquivados</option>
        </select>
        <label className="sr-only" htmlFor="admin-product-sort">
          Ordenar produtos
        </label>
        <select
          id="admin-product-sort"
          className="admin-select"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="recent">Mais recentes</option>
          <option value="name">Nome (A-Z)</option>
          <option value="price-low">Menor preço</option>
          <option value="price-high">Maior preço</option>
        </select>
      </div>

      {selectedProducts.length > 0 && onArchive && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-xs">
          <span className="font-medium">
            {selectedProducts.length} selecionado{selectedProducts.length > 1 ? "s" : ""}
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={bulkBusy}>
                Arquivar selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arquivar produtos selecionados?</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedProducts.length} produto{selectedProducts.length > 1 ? "s" : ""} sair
                  {selectedProducts.length > 1 ? "ão" : "á"} do catálogo ativo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  onClick={() => void archiveSelected()}
                >
                  Confirmar arquivamento em lote
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Limpar seleção
          </Button>
        </div>
      )}
      {bulkError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {bulkError}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="admin-products-table w-full text-left text-sm md:min-w-[720px]">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              {onArchive && (
                <th className="w-10 px-3 py-3 font-semibold">
                  <input
                    type="checkbox"
                    aria-label="Selecionar produtos da página"
                    checked={
                      selectableRows.length > 0 &&
                      selectableRows.every((product) => selected.has(product.id))
                    }
                    disabled={selectableRows.length === 0}
                    onChange={(event) =>
                      setSelected((current) => {
                        const next = new Set(current);
                        for (const product of selectableRows) {
                          if (event.target.checked) next.add(product.id);
                          else next.delete(product.id);
                        }
                        return next;
                      })
                    }
                  />
                </th>
              )}
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Categorias</th>
              <th className="px-4 py-3 font-semibold">Preço</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((product) => {
              const archived = mode === "archived" || product.active === false;
              return (
                <tr key={product.id} className="border-t transition-colors hover:bg-muted/35">
                  {onArchive && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${product.name}`}
                        checked={selected.has(product.id)}
                        disabled={archived}
                        onChange={() => toggleSelected(product.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <div className="flex min-w-[180px] items-center gap-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-12 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-10 items-center justify-center rounded bg-secondary text-xs text-primary">
                          DA
                        </div>
                      )}
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex max-w-[310px] flex-wrap gap-1">
                      {(product.categories?.length ? product.categories : [product.category]).map(
                        (name) => (
                          <span key={name} className="admin-category-chip">
                            {name}
                          </span>
                        ),
                      )}
                    </div>
                  </td>
                  <td className="admin-price-cell px-4 py-2 text-xs font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="admin-status-cell px-4 py-2">
                    <span className={`admin-status ${archived ? "admin-status-archived" : ""}`}>
                      {archived ? "Arquivado" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1.5">
                      {!archived && onEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Editar ${product.name}`}
                          onClick={() => onEdit(product)}
                        >
                          <Pencil /> Editar
                        </Button>
                      )}
                      {archived ? (
                        <>
                          {onRestore && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Reativar ${product.name}`}
                              onClick={() => void onRestore(product)}
                            >
                              <RotateCcw /> Reativar
                            </Button>
                          )}
                          {onDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  aria-label={`Excluir ${product.name}`}
                                >
                                  <Trash2 /> Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir produto permanentemente?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A exclusão é permanente e não pode ser desfeita. O produto{" "}
                                    {product.name} será removido definitivamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className={buttonVariants({ variant: "destructive" })}
                                    onClick={() => void onDelete(product)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </>
                      ) : (
                        onArchive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Arquivar ${product.name}`}
                              >
                                <Archive /> <span className="sr-only">Arquivar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Arquivar produto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {product.name} sairá do catálogo ativo e não aparecerá para
                                  clientes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className={buttonVariants({ variant: "destructive" })}
                                  onClick={() => void onArchive(product)}
                                >
                                  Confirmar arquivamento
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {products.length === 0
              ? mode === "archived"
                ? "Nenhum produto arquivado."
                : "Nenhum produto cadastrado."
              : "Nenhum produto encontrado para estes filtros."}
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </span>
        {pageCount > 1 && (
          <nav aria-label="Páginas de produtos" className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Página anterior"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => (
              <Button
                key={index}
                type="button"
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="icon"
                aria-label={`Página ${index + 1}`}
                aria-current={currentPage === index + 1 ? "page" : undefined}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Próxima página"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </nav>
        )}
      </div>
    </section>
  );
}
