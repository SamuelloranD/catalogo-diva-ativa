import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CatalogProduct } from "@/lib/catalog-types";

const pricedProduct: CatalogProduct = {
  id: "priced-product",
  name: "Conjunto Aurora",
  brand: "Diva Ativa",
  category: "Conjuntos",
  color: "Cores disponíveis",
  images: ["/aurora.jpg"],
  tag: "",
  description: "Conjunto Aurora.",
  price: 129.9,
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
  it("shows the BRL price and changes the consultation message for priced products", () => {
    render(<Catalog />);

    expect(screen.getByText("R$ 129,90")).toBeInTheDocument();
    expect(screen.getByText("Consultar cores disponíveis")).toBeInTheDocument();
    expect(screen.queryByText("Consultar valores e cores disponíveis")).not.toBeInTheDocument();
  });
});
