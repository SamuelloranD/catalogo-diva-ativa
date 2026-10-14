import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/catalog-types";

const pricedProduct: CatalogProduct = {
  id: "priced-product",
  name: "Conjunto Aurora",
  brand: "Diva Ativa",
  category: "Conjuntos",
  color: "",
  images: ["/aurora.jpg"],
  tag: "",
  description: "Conjunto Aurora.",
  price: 129.9,
  sizes: ["P", "M", "G1", "G2"],
};
vi.mock("@/hooks/use-catalog", () => ({
  useCatalog: () => ({
    products: [pricedProduct],
    categories: ["Todas as peças", "Conjuntos"],
    loading: false,
    error: null,
    source: "local",
  }),
}));
import { Catalog } from "@/routes/index";

describe("Catalog product prices", () => {
  it("shows price, individual sizes and estimated subtotal", () => {
    render(<Catalog />);
    expect(screen.getByText("R$ 129,90")).toBeInTheDocument();
    expect(screen.queryByText("3 X sem juros")).not.toBeInTheDocument();
    expect(screen.queryByText("5% de desconto no PIX")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver Conjunto Aurora" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "G1" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "G2" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "GG indisponível" })).toBeDisabled();
    expect(within(dialog).getByText("3 X sem juros")).toBeInTheDocument();
    expect(within(dialog).getByText("5% de desconto no PIX")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "G1" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Adicionar à sacola" }));
    expect(screen.queryByText("3 X sem juros")).not.toBeInTheDocument();
    expect(screen.queryByText("5% de desconto no PIX")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abrir sacola, 1 itens" }));
    expect(within(screen.getByRole("dialog")).getByText("Subtotal estimado")).toBeInTheDocument();
  });
});
