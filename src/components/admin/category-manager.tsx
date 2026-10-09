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
import { Pencil, Trash2 } from "lucide-react";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await onCreate(name.trim());
      setName("");
      setError("");
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
    <section className="grid gap-4 rounded-2xl border bg-background p-5">
      <div>
        <h3 className="font-medium">Categorias</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione e organize as categorias usadas nos produtos.
        </p>
      </div>
      <form className="flex flex-wrap gap-2" onSubmit={handleSubmit}>
        <Input
          aria-label="Nova categoria"
          className="min-w-52 flex-1"
          placeholder="Ex.: Saias"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit">Adicionar categoria</Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="divide-y rounded-xl border">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 px-3 py-2">
              {editingCategoryId === category.id ? (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
                  <div className="flex shrink-0 items-center gap-1">
                    {onUpdate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => startEditing(category)}
                      >
                        <Pencil aria-hidden="true" />
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
          <p className="px-3 py-4 text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </section>
  );
}
