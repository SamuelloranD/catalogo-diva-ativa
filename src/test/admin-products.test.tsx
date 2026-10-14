import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  it("opens the new product form as a dedicated admin view", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Novo produto" }));

    expect(screen.getByRole("heading", { name: "Novo produto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar para produtos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Informações gerais" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens product editing in the dedicated view", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));

    expect(screen.getByRole("heading", { name: "Editar produto" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Descrição do conjunto.")).toBeInTheDocument();
  });

  it("confirms before discarding a filled new product", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Novo produto" }));
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Jade Premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Voltar para produtos" }));

    const confirmation = screen.getByRole("alertdialog");

    expect(confirmation).toHaveTextContent("Descartar alterações?");
    expect(confirmation).toHaveTextContent("Os campos preenchidos serão perdidos.");
  });

  it("confirms before discarding changes to an existing product", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Jade Premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Voltar para produtos" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Descartar alterações?");
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "As alterações feitas serão perdidas.",
    );
  });

  it("confirms before replacing an edited product with a new one", () => {
    renderAdminShell();
    fireEvent.click(screen.getByRole("button", { name: "Editar Conjunto Aurora" }));
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Conjunto alterado" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Adicionar produto" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Descartar alterações?");
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    expect(screen.getByRole("heading", { name: "Novo produto" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da peça")).toHaveValue("");
  });

  it("switches between product and category management", () => {
    renderAdminShell();

    fireEvent.click(screen.getByRole("button", { name: /^Categorias$/ }));
    expect(screen.getByRole("heading", { name: "Categorias" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nova categoria" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Produtos" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Produtos$/ }));
    expect(screen.getByRole("heading", { name: "Produtos" })).toBeInTheDocument();
  });

  it("submits a new category", () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CategoryManager categories={[category]} onCreate={onCreate} />);

    fireEvent.click(screen.getByRole("button", { name: "Nova categoria" }));
    fireEvent.change(screen.getByLabelText("Nova categoria"), { target: { value: "Saias" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar categoria" }));

    expect(onCreate).toHaveBeenCalledWith("Saias");
  });

  it("filters categories by name and shows linked product counts", () => {
    const secondCategory = { ...category, id: "running", name: "Corrida", slug: "corrida" };
    render(
      <CategoryManager
        categories={[category, secondCategory]}
        products={[product]}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByText("1 produto")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar categorias" }), {
      target: { value: "corrida" },
    });
    expect(screen.getByText("Corrida")).toBeInTheDocument();
    expect(screen.queryByText("Conjuntos")).not.toBeInTheDocument();
  });

  it("shows category creation dates and sorts products by actual creation time", () => {
    const older = {
      ...product,
      id: "older",
      name: "Peça antiga",
      createdAt: "2026-10-01T12:00:00Z",
    };
    const newer = {
      ...product,
      id: "newer",
      name: "Peça recente",
      createdAt: "2026-10-13T12:00:00Z",
    };
    const { unmount } = render(<ProductTable products={[older, newer]} />);
    expect(
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.textContent),
    ).toEqual([expect.stringContaining("Peça recente"), expect.stringContaining("Peça antiga")]);
    unmount();

    render(
      <CategoryManager
        categories={[{ ...category, createdAt: "2026-10-13T12:00:00Z" }]}
        onCreate={vi.fn()}
      />,
    );
    expect(screen.getByText("13/10/2026")).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: /^Excluir$/ }));

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
    fireEvent.click(screen.getByRole("button", { name: /^Excluir$/ }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Tem certeza que deseja excluir a categoria Conjuntos?",
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Produtos vinculados também serão excluídos.",
    );
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^Excluir$/ }));

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
      "w-full",
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

  it("saves secondary categories, individual sizes and optional colors", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const runningCategory = { ...category, id: "running", name: "Corrida", slug: "corrida" };
    render(
      <ProductForm categories={[category, runningCategory]} onSave={onSave} onCancel={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("Nome da peça"), {
      target: { value: "Conjunto Corrida" },
    });
    fireEvent.keyDown(screen.getByRole("button", { name: "Selecione a categoria" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Conjuntos" }));
    fireEvent.click(screen.getByLabelText("Corrida"));
    expect(screen.getByLabelText("G1")).toBeChecked();
    expect(screen.getByLabelText("G2")).toBeChecked();
    expect(screen.getByLabelText("GG")).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /Adicionar cor/ }));
    fireEvent.change(screen.getByLabelText("Nome da cor 1"), { target: { value: "Vinho" } });
    fireEvent.click(screen.getByLabelText("Tamanho M da cor Vinho"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: [category.id, runningCategory.id],
          sizes: ["M"],
          colors: [{ name: "Vinho", sizes: ["M"] }],
        }),
        expect.any(Array),
        expect.any(Array),
        expect.any(Array),
      ),
    );
  });

  it("saves distinct available sizes for each color", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm categories={[category]} onSave={onSave} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nome da peça"), { target: { value: "Conjunto X" } });
    fireEvent.keyDown(screen.getByRole("button", { name: "Selecione a categoria" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Conjuntos" }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar cor/ }));
    fireEvent.change(screen.getByLabelText("Nome da cor 1"), { target: { value: "Verde" } });
    fireEvent.click(screen.getByLabelText("Tamanho P da cor Verde"));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar cor/ }));
    fireEvent.change(screen.getByLabelText("Nome da cor 2"), { target: { value: "Rosa" } });
    fireEvent.click(screen.getByLabelText("Tamanho G da cor Rosa"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sizes: ["P", "G"],
          colors: [
            { name: "Verde", sizes: ["P"] },
            { name: "Rosa", sizes: ["G"] },
          ],
        }),
        expect.any(Array),
        expect.any(Array),
        expect.any(Array),
      ),
    );
  });

  it("requires sizes for each color of a sized product", () => {
    const onSave = vi.fn();
    render(<ProductForm categories={[category]} onSave={onSave} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Nome da peça"), { target: { value: "Conjunto X" } });
    fireEvent.keyDown(screen.getByRole("button", { name: "Selecione a categoria" }), {
      key: "ArrowDown",
    });
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Conjuntos" }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar cor/ }));
    fireEvent.change(screen.getByLabelText("Nome da cor 1"), { target: { value: "Verde" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Selecione ao menos um tamanho para cada cor.",
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps legacy color availability when an existing product is edited", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const legacyProduct = {
      ...product,
      sizes: ["P", "G"],
      colors: [{ name: "Verde", hex: "#476243" }],
    };
    render(
      <ProductForm
        product={legacyProduct}
        categories={[category]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Tamanho P da cor Verde")).toBeChecked();
    expect(screen.getByLabelText("Tamanho G da cor Verde")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          sizes: ["P", "G"],
          colors: [{ name: "Verde", hex: "#476243", sizes: ["P", "G"] }],
        }),
        expect.any(Array),
        expect.any(Array),
        expect.any(Array),
      ),
    );
  });

  it("lets mobile editors switch between general details, variations and photos", () => {
    render(<ProductForm categories={[category]} onSave={vi.fn()} onCancel={vi.fn()} />);
    const variations = screen.getByRole("button", { name: "Variações" });
    const photos = screen.getByRole("button", { name: "Fotos" });

    fireEvent.click(variations);
    expect(variations).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Tamanhos disponíveis" })).toBeInTheDocument();
    fireEvent.click(photos);
    expect(photos).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Fotos do produto" })).toBeInTheDocument();
  });

  it("explains a missing Supabase schema column when saving a product", async () => {
    const onSave = vi.fn().mockRejectedValue({
      code: "PGRST204",
      message: "Could not find the 'sizes' column of 'products' in the schema cache",
    });
    render(
      <ProductForm product={product} categories={[category]} onSave={onSave} onCancel={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("20261014_product_variations.sql");
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

    expect(archiveButton).toHaveClass("text-muted-foreground");
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

    for (const header of ["Produto", "Categorias", "Preço", "Status", "Ações"]) {
      expect(screen.getByRole("columnheader", { name: header })).toHaveClass("font-semibold");
    }
  });

  it("filters, paginates and includes archived products in the dashboard", () => {
    const products = Array.from({ length: 7 }, (_, index) => ({
      ...product,
      id: `product-${index}`,
      name: `Peça ${index + 1}`,
      active: index !== 6,
      createdAt: `2026-10-${String(index + 1).padStart(2, "0")}T12:00:00Z`,
    }));
    render(<ProductTable products={products} categories={[category]} mode="all" />);

    expect(screen.getAllByRole("row")).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText("Peça 1")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar produtos" }), {
      target: { value: "Peça 7" },
    });
    expect(screen.getByText("Peça 7")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filtrar por status"), {
      target: { value: "active" },
    });
    expect(screen.getByText("Nenhum produto encontrado para estes filtros.")).toBeInTheDocument();
  });

  it("keeps product pagination compact when there are many pages", () => {
    const products = Array.from({ length: 50 }, (_, index) => ({
      ...product,
      id: `product-${index}`,
      name: `Peça ${index + 1}`,
    }));
    render(<ProductTable products={products} mode="all" />);

    const pages = screen.getByRole("navigation", { name: "Páginas de produtos" });
    expect(within(pages).getByRole("button", { name: "Página 1" })).toBeInTheDocument();
    expect(within(pages).getByRole("button", { name: "Página 3" })).toBeInTheDocument();
    expect(within(pages).queryByRole("button", { name: "Página 4" })).not.toBeInTheDocument();

    fireEvent.click(within(pages).getByRole("button", { name: "Página 3" }));
    expect(within(pages).getByRole("button", { name: "Página 4" })).toBeInTheDocument();
    expect(within(pages).queryByRole("button", { name: "Página 1" })).not.toBeInTheDocument();
  });

  it("archives selected active products after confirmation", async () => {
    const onArchive = vi.fn().mockResolvedValue(undefined);
    render(<ProductTable products={[product]} mode="all" onArchive={onArchive} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Conjunto Aurora" }));
    fireEvent.click(screen.getByRole("button", { name: "Arquivar selecionados" }));
    expect(onArchive).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar arquivamento em lote" }));
    await waitFor(() => expect(onArchive).toHaveBeenCalledWith(product));
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
    fireEvent.click(screen.getByRole("button", { name: /^Excluir$/ }));

    expect(onDelete).toHaveBeenCalledWith(archivedProduct);
  });
});
