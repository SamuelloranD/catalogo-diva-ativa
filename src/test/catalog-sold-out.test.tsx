import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/catalog-types";

const soldOutProduct: CatalogProduct = {
  id: "sold-out-1",
  name: "Conjunto Esgotado",
  brand: "Diva Ativa",
  category: "Conjuntos",
  color: "",
  images: ["/sold-out.jpg"],
  sizes: ["P"],
  tag: "Esgotado",
  description: "",
};

vi.mock("@/hooks/use-catalog", () => ({
  useCatalog: () => ({
    products: [soldOutProduct],
    categories: ["Todas as peças", "Conjuntos"],
    loading: false,
    error: null,
    source: "local",
  }),
}));

import { Catalog } from "@/routes/index";

describe("Sold out catalog products", () => {
  it("keeps the badge and blocks adding a selected sold out item to the bag", () => {
    render(<Catalog />);
    const card = screen.getByRole("article");
    expect(within(card).getByText("Esgotado")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Escolher opções" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "P" }));
    expect(within(dialog).getByRole("button", { name: "Adicionar à sacola" })).toBeDisabled();
    expect(within(dialog).getByText("Esta peça está esgotada.")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar produto" }));
    expect(screen.getByRole("button", { name: "Abrir sacola, 0 itens" })).toBeInTheDocument();
  });
});
