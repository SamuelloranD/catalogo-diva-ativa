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
import type { CatalogProduct } from "@/lib/catalog-types";
import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";

type ProductTableProps = {
  products: CatalogProduct[];
  mode?: "active" | "archived";
  onEdit?: (product: CatalogProduct) => void;
  onArchive?: (product: CatalogProduct) => Promise<void>;
  onRestore?: (product: CatalogProduct) => Promise<void>;
  onDelete?: (product: CatalogProduct) => Promise<void>;
};

export function ProductTable({
  products,
  mode = "active",
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ProductTableProps) {
  const archived = mode === "archived";
  const itemLabel = products.length === 1 ? "produto" : "produtos";
  const statusLabel = archived
    ? products.length === 1
      ? "arquivado"
      : "arquivados"
    : products.length === 1
      ? "ativo"
      : "ativos";

  return (
    <section className="grid gap-4 rounded-2xl border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">{archived ? "Produtos arquivados" : "Produtos"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} {itemLabel} {statusLabel}.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-semibold">Produto</th>
              <th className="px-3 py-3 font-semibold">Categoria</th>
              <th className="px-3 py-3 font-semibold">Imagens</th>
              <th className="px-3 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="px-3 py-3 font-medium">{product.name}</td>
                <td className="px-3 py-3 text-muted-foreground">{product.category}</td>
                <td className="px-3 py-3 text-muted-foreground">{product.images.length}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    {!archived && onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => onEdit(product)}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Button>
                    )}
                    {archived ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Reativar ${product.name}`}
                          onClick={() => void onRestore?.(product)}
                        >
                          <RotateCcw aria-hidden="true" />
                          Reativar
                        </Button>
                        {onDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Excluir ${product.name}`}
                              >
                                <Trash2 aria-hidden="true" />
                                Excluir
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                            aria-label={`Arquivar ${product.name}`}
                          >
                            <Archive aria-hidden="true" />
                            Arquivar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Arquivar produto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {product.name} sairá do catálogo ativo e não aparecerá para clientes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className={buttonVariants({ variant: "destructive" })}
                              onClick={() => void onArchive?.(product)}
                            >
                              Confirmar arquivamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {archived ? "Nenhum produto arquivado." : "Nenhum produto cadastrado."}
          </p>
        )}
      </div>
    </section>
  );
}
