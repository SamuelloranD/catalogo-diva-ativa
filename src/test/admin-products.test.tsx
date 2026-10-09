import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CategoryManager } from "@/components/admin/category-manager";
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

describe("Admin product controls", () => {
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
        expect.objectContaining({ name: "Conjunto Aurora", categoryId: category.id }),
        expect.any(Array),
        expect.any(Array),
        expect.any(Array),
      ),
    );
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
    fireEvent.click(screen.getByRole("button", { name: "Arquivar Conjunto Aurora" }));

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
