import { useState, type FormEvent, type MouseEvent } from "react";

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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog-types";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

type CategoryManagerProps = {
  categories: CatalogCategory[];
  products?: CatalogProduct[];
  onCreate: (name: string) => Promise<unknown>;
  onUpdate?: (id: string, name: string) => Promise<unknown>;
  onDelete?: (category: CatalogCategory) => Promise<unknown>;
};

export function CategoryManager({
  categories,
  products = [],
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string>();
  const [editingName, setEditingName] = useState("");
  const [busyCategoryId, setBusyCategoryId] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<CatalogCategory>();
  const [deleteStage, setDeleteStage] = useState<"initial" | "linked">("initial");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const visibleCategories = categories.filter((category) =>
    category.name.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await onCreate(name.trim());
      setName("");
      setError("");
      setShowCreate(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a categoria.");
    }
  }

  function startEditing(category: CatalogCategory) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setError("");
  }

  function cancelEditing() {
    setEditingCategoryId(undefined);
    setEditingName("");
  }

  async function handleUpdate(category: CatalogCategory) {
    if (!onUpdate || !editingName.trim()) return;

    setBusyCategoryId(category.id);
    setError("");
    try {
      await onUpdate(category.id, editingName.trim());
      cancelEditing();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível editar a categoria.");
    } finally {
      setBusyCategoryId(undefined);
    }
  }

  async function handleDelete(category: CatalogCategory) {
    if (!onDelete) return;

    setBusyCategoryId(category.id);
    setError("");
    try {
      await onDelete(category);
      setPendingDelete(undefined);
      setDeleteStage("initial");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível excluir a categoria.");
    } finally {
      setBusyCategoryId(undefined);
    }
  }

  function openDeleteDialog(category: CatalogCategory) {
    setPendingDelete(category);
    setDeleteStage("initial");
    setError("");
  }

  function closeDeleteDialog() {
    if (busyCategoryId) return;
    setPendingDelete(undefined);
    setDeleteStage("initial");
  }

  function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    if (!pendingDelete) return;

    const hasLinkedProducts = products.some((product) => product.categoryId === pendingDelete.id);
    if (hasLinkedProducts && deleteStage === "initial") {
      event.preventDefault();
      setDeleteStage("linked");
      return;
    }

    void handleDelete(pendingDelete);
  }

  return (
    <section className="admin-panel grid gap-5 rounded-xl border bg-background p-4 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize as categorias utilizadas no catálogo.
          </p>
        </div>
        <Button type="button" onClick={() => setShowCreate((open) => !open)}>
          <Plus /> Nova categoria
        </Button>
      </div>
      {showCreate && (
        <form
          className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Nova categoria"
            className="min-w-52 flex-1"
            placeholder="Ex.: Saias"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="submit">Adicionar categoria</Button>
        </form>
      )}
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Buscar categorias"
          placeholder="Buscar categorias..."
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="divide-y overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1fr)_70px_86px] bg-muted/60 px-3 py-3 text-xs font-semibold text-muted-foreground sm:grid-cols-[minmax(0,1fr)_95px_130px_130px]">
          <span>Nome da categoria</span>
          <span>Produtos</span>
          <span className="hidden sm:block">Data de criação</span>
          <span className="text-right">Ações</span>
        </div>
        {visibleCategories.length > 0 ? (
          visibleCategories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-[minmax(0,1fr)_70px_86px] items-center gap-1 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_95px_130px_130px]"
            >
              {editingCategoryId === category.id ? (
                <div className="col-span-3 flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:col-span-4">
                  <Input
                    aria-label={`Editar categoria ${category.name}`}
                    className="h-8 min-w-48 flex-1"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyCategoryId === category.id || !editingName.trim()}
                    onClick={() => void handleUpdate(category)}
                  >
                    Salvar categoria
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <span className="min-w-0 truncate text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {
                      products.filter((product) =>
                        (product.categoryIds ?? [product.categoryId]).includes(category.id),
                      ).length
                    }{" "}
                    {products.filter((product) =>
                      (product.categoryIds ?? [product.categoryId]).includes(category.id),
                    ).length === 1
                      ? "produto"
                      : "produtos"}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString("pt-BR", {
                          timeZone: "UTC",
                        })
                      : "—"}
                  </span>
                  <div className="flex shrink-0 items-center justify-end gap-1">
                    {onUpdate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => startEditing(category)}
                      >
                        <Pencil aria-hidden="true" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    )}
                    {onDelete && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Excluir ${category.name}`}
                          disabled={busyCategoryId === category.id}
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                        <AlertDialog
                          open={pendingDelete?.id === category.id}
                          onOpenChange={(open) => !open && closeDeleteDialog()}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {deleteStage === "linked"
                                  ? `Tem certeza que deseja excluir a categoria ${category.name}?`
                                  : "Excluir categoria?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {deleteStage === "linked"
                                  ? "Produtos vinculados também serão excluídos."
                                  : `A categoria “${category.name}” será removida.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className={buttonVariants({ variant: "destructive" })}
                                onClick={confirmDelete}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="px-3 py-6 text-sm text-muted-foreground">
            {categories.length ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."}
          </p>
        )}
      </div>
    </section>
  );
}
