import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/catalog-types";

const product: CatalogProduct = {
  id: "fit-1",
  name: "Macacão Teste",
  brand: "Diva Ativa",
  category: "Macacões",
  categories: ["Macacões", "Corrida", "Plus Size"],
  color: "",
  images: ["/fit.jpg"],
  colors: [
    { name: "Vinho", hex: "#6a2528", sizes: ["P", "M"] },
    { name: "Preto", hex: "#111111", sizes: ["G1", "G2"] },
  ],
  sizes: ["P", "M", "G1", "G2"],
  tag: "",
  description: "Peça de teste.",
  price: 149.3,
};
const plain: CatalogProduct = {
  id: "plain-1",
  name: "Regata Simples",
  brand: "Diva Ativa",
  category: "Corrida",
  color: "",
  images: [],
  sizes: [],
  tag: "",
  description: "",
};
vi.mock("@/hooks/use-catalog", () => ({
  useCatalog: () => ({
    products: [product, plain],
    categories: ["Todas as peças", "Macacões", "Corrida", "Plus Size"],
    loading: false,
    error: null,
    source: "local",
  }),
}));
import { Catalog } from "@/routes/index";

function addVariation(color: string, size: string) {
  fireEvent.click(screen.getByRole("button", { name: "Ver Macacão Teste" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: `Cor ${color}` }));
  fireEvent.click(within(dialog).getByRole("button", { name: size }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Adicionar à sacola" }));
}

describe("Catalog variations", () => {
  it("disables colors after a size is chosen and sizes after a color is chosen", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macacão Teste" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "P" }));
    const black = within(dialog).getByRole("button", { name: "Cor Preto indisponível" });
    expect(black).toBeDisabled();
    expect(black.querySelector(".catalog-color-swatch")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "P" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Cor Preto" }));
    expect(within(dialog).getByRole("button", { name: "P indisponível" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "G1" })).toBeEnabled();
    expect(within(dialog).getByRole("button", { name: "Adicionar à sacola" })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "G1" }));
    expect(within(dialog).getByRole("button", { name: "Adicionar à sacola" })).toBeEnabled();
  });

  it("shows catalog search below the product section title", () => {
    render(<Catalog />);
    const heading = screen.getByRole("heading", { name: "Encontre seu próximo look" });
    const search = screen.getByRole("textbox", { name: "Buscar no catálogo" });
    expect(heading.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.change(search, { target: { value: "Macacão Teste" } });
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("shows round color swatches above their names and outlines only the selected swatch", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macacão Teste" }));
    const dialog = screen.getByRole("dialog");
    const wine = within(dialog).getByRole("button", { name: "Cor Vinho" });
    const black = within(dialog).getByRole("button", { name: "Cor Preto" });
    expect(wine).toHaveClass("catalog-color-option");
    expect(wine.querySelector(".catalog-color-swatch")).toBeInTheDocument();
    expect(within(wine).getByText("Vinho")).toBeInTheDocument();
    expect(wine).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(wine);
    expect(wine).toHaveAttribute("aria-pressed", "true");
    expect(black).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(black);
    expect(wine).toHaveAttribute("aria-pressed", "false");
    expect(black).toHaveAttribute("aria-pressed", "true");
  });

  it("shows every size and blocks unavailable options", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macacão Teste" }));
    const dialog = screen.getByRole("dialog");
    for (const available of ["P", "M", "G1", "G2"]) {
      expect(within(dialog).getByRole("button", { name: available })).toBeEnabled();
    }
    for (const unavailable of ["G", "GG", "Único"]) {
      const option = within(dialog).getByRole("button", { name: `${unavailable} indisponível` });
      expect(option).toBeDisabled();
      expect(option).toHaveClass("catalog-size-option");
    }
    expect(within(dialog).getByRole("button", { name: "Adicionar à sacola" })).toBeDisabled();
  });

  it("shows a multicategory product only once and searches secondary categories", () => {
    render(<Catalog />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Plus Size" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Todas as peças" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar produtos" }), {
      target: { value: "Corrida" },
    });
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("requires size and color, preserves separate variations and adjusts quantities", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macacão Teste" }));
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Adicionar à sacola" }),
    ).toBeDisabled();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Fechar produto" }),
    );
    addVariation("Vinho", "M");
    addVariation("Preto", "G1");
    fireEvent.click(screen.getByRole("button", { name: "Abrir sacola, 2 itens" }));
    const bag = screen.getByRole("dialog");
    expect(within(bag).getByText("Cor: Vinho")).toBeInTheDocument();
    expect(within(bag).getByText("Cor: Preto")).toBeInTheDocument();
    expect(
      within(
        within(bag).getAllByRole("combobox", { name: "Alterar tamanho de Macacão Teste" })[0]!,
      ).getByRole("option", { name: "G1 (indisponível)" }),
    ).toBeDisabled();
    expect(
      within(
        within(bag).getAllByRole("combobox", { name: "Alterar cor de Macacão Teste" })[0]!,
      ).getByRole("option", { name: "Preto (indisponível)" }),
    ).toBeDisabled();
    expect(within(bag).getByText("R$ 298,60")).toBeInTheDocument();
    fireEvent.click(within(bag).getAllByRole("button", { name: "Aumentar Macacão Teste" })[0]!);
    expect(within(bag).getByText("R$ 447,90")).toBeInTheDocument();
    fireEvent.click(within(bag).getAllByRole("button", { name: "Remover Macacão Teste" })[0]!);
    expect(within(bag).queryByText("Cor: Vinho")).not.toBeInTheDocument();
  });

  it("shows a missing photo without using another product and adds a size free product", () => {
    render(<Catalog />);
    expect(screen.getByText("Fotografia indisponível")).toBeInTheDocument();
    expect(screen.queryByText("3 X sem juros")).not.toBeInTheDocument();
    expect(screen.queryByText("5% de desconto no PIX")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver Regata Simples" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("3 X sem juros").parentElement).toHaveClass("text-primary");
    expect(within(dialog).getByText("5% de desconto no PIX").parentElement).toHaveClass(
      "text-primary",
    );
    expect(within(dialog).getByRole("button", { name: "Adicionar à sacola" })).toBeEnabled();
  });
  it("offers message copying when the browser blocks WhatsApp", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<Catalog />);
    addVariation("Vinho", "M");
    fireEvent.click(screen.getByRole("button", { name: "Abrir sacola, 1 itens" }));
    const bag = screen.getByRole("dialog");
    fireEvent.click(within(bag).getByRole("button", { name: "Concluir pedido no WhatsApp" }));
    expect(within(bag).getByRole("button", { name: "Copiar mensagem" })).toBeInTheDocument();
    open.mockRestore();
  });
});
