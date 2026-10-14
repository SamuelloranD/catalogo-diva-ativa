import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/catalog-types";

const accessoryProduct: CatalogProduct = {
  id: "accessory-bag",
  name: "Bolsa Fitness",
  brand: "Diva Ativa",
  category: "Acessórios",
  color: "",
  images: ["/bolsa.jpg"],
  tag: "",
  description: "Bolsa para acompanhar sua rotina.",
  sizes: [],
};
vi.mock("@/hooks/use-catalog", () => ({
  useCatalog: () => ({
    products: [accessoryProduct],
    categories: ["Todas as peças", "Acessórios"],
    loading: false,
    error: null,
    source: "local",
  }),
}));
import { Catalog } from "@/routes/index";

describe("Accessory products", () => {
  it("adds an unsized accessory without color and shows consultation price", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Bolsa Fitness" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: "P" })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Adicionar à sacola" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir sacola, 1 itens" }));
    const bag = screen.getByRole("dialog");
    expect(within(bag).queryByText(/Tamanho:/)).not.toBeInTheDocument();
    expect(within(bag).getAllByText("Valor sob consulta").length).toBeGreaterThan(0);
  });
});
