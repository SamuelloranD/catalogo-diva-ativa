import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { CategoryManager } from "@/components/admin/category-manager";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { ProductTable } from "@/components/admin/product-table";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog-types";

const category: CatalogCategory = {
  id: "cat-1",
  name: "Conjuntos",
  slug: "conjuntos",
  active: true,
  sortOrder: 1,
};

const product: CatalogProduct = {
  id: "product-1",
  name: "Conjunto Aurora",
  brand: "Atletika",
  category: "Conjuntos",
  categoryId: category.id,
  color: "Cores disponíveis",
  images: ["/aurora.jpg"],
  tag: "",
  description: "Descrição do conjunto.",
};

function renderAdminShell() {
  return render(
    <AdminShell
      user={{ email: "admin@divaativa.com" } as User}
      products={[product]}
      archivedProducts={[]}
      categories={[category]}
      loading={false}
      onCreateCategory={vi.fn().mockResolvedValue(category)}
      onUpdateCategory={vi.fn().mockResolvedValue(undefined)}
      onDeleteCategory={vi.fn().mockResolvedValue(undefined)}
      onSaveProduct={vi.fn().mockResolvedValue(undefined)}
      onArchiveProduct={vi.fn().mockResolvedValue(undefined)}
      onRestoreProduct={vi.fn().mockResolvedValue(undefined)}
      onDeleteProduct={vi.fn().mockResolvedValue(undefined)}
      onSignOut={vi.fn().mockResolvedValue(undefined)}
    />,
  );
}

describe("Admin product controls", () => {
  it("opens the new product form in a modal", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Novo produto" }));

    const dialog = screen.getByRole("dialog");
    const closeButton = screen.getByRole("button", { name: "Fechar modal" });

    expect(dialog).toHaveTextContent("Novo produto");
    expect(screen.getByRole("dialog")).toHaveTextContent("Preencha os dados exibidos no catálogo.");
    expect(dialog).toHaveClass("rounded-2xl", "bg-background", "overflow-hidden");
    expect(dialog).not.toHaveClass("overflow-y-auto");
    expect(dialog.querySelector(".admin-product-modal-scroll")).toHaveClass(
      "overflow-x-hidden",
      "overflow-y-auto",
    );
    expect(dialog.querySelector("form")).toContainElement(closeButton);
    expect(dialog.querySelector("form")).not.toHaveClass("rounded-2xl", "border");
    expect(closeButton).toHaveClass("h-9", "w-9", "bg-destructive");
    expect(document.querySelector(".backdrop-blur-sm")).toHaveClass("bg-overlay/80");
  });

  it("opens the edit product form in a modal", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Editar produto");
    expect(screen.getByRole("dialog")).toHaveTextContent("Descrição do conjunto.");
  });

  it("confirms before discarding a filled new product", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Novo produto" }));
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Jade Premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));

    const confirmation = screen.getByRole("alertdialog");

    expect(confirmation).toHaveClass("w-[calc(100%-2rem)]", "rounded-2xl", "overflow-x-hidden");
    expect(confirmation).toHaveTextContent("Descartar alterações?");
    expect(confirmation).toHaveTextContent("Os campos preenchidos serão perdidos.");
  });

  it("confirms before discarding changes to an existing product", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Jade Premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Descartar alterações?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "As alterações feitas serão perdidas.",
    );
  });

  it("submits a new category", () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CategoryManager categories={[category]} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText("Nova categoria"), { target: { value: "Saias" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    expect(onCreate).toHaveBeenCalledWith("Saias");
  });

  it("edits a category from the category list", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <CategoryManager
        categories={[category]}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjuntos" }));
    fireEvent.change(screen.getByLabelText("Editar categoria Conjuntos"), {
      target: { value: "Saias" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar categoria" }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(category.id, "Saias"));
  });

  it("confirms before deleting a category", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <CategoryManager
        categories={[category]}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Conjuntos" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Conjuntos");
    expect(onDelete).not.toHaveBeenCalled();

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "A categoria “Conjuntos” será removida.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Excluir", exact: true }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(category));
  });

  it("requires a second confirmation when a category has linked products", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <CategoryManager
        categories={[category]}
        products={[product]}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir Conjuntos" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir", exact: true }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Tem certeza que deseja excluir a categoria Conjuntos?",
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Produtos vinculados também serão excluídos.",
    );
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Excluir", exact: true }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(category));
  });

  it("submits product metadata", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm categories={[category]} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Conjunto Aurora" },
    });
    const priceInput = screen.getByLabelText("Valor (BRL)");
    for (const key of ["1", "2", "9", "9", "9"]) {
      fireEvent.keyDown(priceInput, { key });
    }
    expect(screen.getByRole("button", { name: "Selecione a categoria" })).toHaveClass(
      "catalog-dropdown-trigger-compact",
      "sm:w-64",
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Selecione a categoria" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Conjuntos" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Categoria: Conjuntos" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Conjunto Aurora",
          categoryId: category.id,
          price: 129.99,
        }),
        expect.any(Array),
        expect.any(Array),
        expect.any(Array),
      ),
    );
  });

  it("starts the BRL input at zero and shifts digits from right to left", () => {
    render(<ProductForm categories={[category]} onSave={vi.fn()} onCancel={vi.fn()} />);

    const priceInput = screen.getByLabelText("Valor (BRL)");
    expect(priceInput).toHaveValue("0,00");
    expect(priceInput).toHaveAttribute("inputmode", "numeric");
    expect(priceInput).not.toHaveAttribute("readonly");
    expect(screen.getByText("R$", { selector: "span" })).toBeInTheDocument();

    fireEvent.keyDown(priceInput, { key: "1" });
    fireEvent.keyDown(priceInput, { key: "2" });
    fireEvent.keyDown(priceInput, { key: "9" });
    expect(priceInput).toHaveValue("1,29");

    fireEvent.keyDown(priceInput, { key: "Backspace" });
    expect(priceInput).toHaveValue("0,12");
  });

  it("uses a custom photo picker without the native filename text", () => {
    render(<ProductForm categories={[category]} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText("Adicionar fotos")).toHaveClass("sr-only");
    expect(screen.getByText("Escolher arquivos")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum arquivo escolhido")).not.toBeInTheDocument();
  });

  it("allows adding a category from the product form", async () => {
    const onCreateCategory = vi.fn().mockResolvedValue({ ...category, name: "Saias" });
    render(
      <ProductForm
        categories={[category]}
        onCreateCategory={onCreateCategory}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ Nova categoria" }));
    fireEvent.change(screen.getByLabelText("Nome da nova categoria"), {
      target: { value: "Saias" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    await waitFor(() => expect(onCreateCategory).toHaveBeenCalledWith("Saias"));
  });

  it("uses explicit action labels and confirms before archiving a product", () => {
    const onEdit = vi.fn();
    const onArchive = vi.fn().mockResolvedValue(undefined);
    render(<ProductTable products={[product]} onEdit={onEdit} onArchive={onArchive} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));
    const archiveButton = screen.getByRole("button", { name: "Arquivar Conjunto Aurora" });

    expect(archiveButton).toHaveClass("bg-destructive/10");
    fireEvent.click(archiveButton);

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Conjunto Aurora");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("clientes");
    expect(onArchive).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onArchive).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Arquivar Conjunto Aurora" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar arquivamento" }));

    expect(onEdit).toHaveBeenCalledWith(product);
    expect(onArchive).toHaveBeenCalledWith(product);
  });

  it("renders all product table headers in bold", () => {
    render(<ProductTable products={[product]} onEdit={vi.fn()} onArchive={vi.fn()} />);

    for (const header of ["Produto", "Categoria", "Imagens", "Ações"]) {
      expect(screen.getByRole("columnheader", { name: header })).toHaveClass("font-semibold");
    }
  });

  it("shows archived products with a reactivation action", () => {
    const onRestore = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const archivedProduct = { ...product, active: false };

    render(
      <ProductTable
        products={[archivedProduct]}
        mode="archived"
        onEdit={vi.fn()}
        onRestore={onRestore}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole("heading", { name: "Produtos arquivados" })).toBeInTheDocument();
    expect(screen.getByText("1 produto arquivado.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reativar Conjunto Aurora" }));

    expect(onRestore).toHaveBeenCalledWith(archivedProduct);

    fireEvent.click(screen.getByRole("button", { name: "Excluir Conjunto Aurora" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "A exclusão é permanente e não pode ser desfeita.",
    );
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Excluir Conjunto Aurora" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir", exact: true }));

    expect(onDelete).toHaveBeenCalledWith(archivedProduct);
  });
});
