import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CatalogProduct } from "@/lib/catalog-types";

const accessoryProduct: CatalogProduct = {
  id: "accessory-bag",
  name: "Bolsa Fitness",
  brand: "Diva Ativa",
  category: "Acessórios",
  color: "Cores disponíveis",
  images: ["/bolsa.jpg"],
  tag: "",
  description: "Bolsa para acompanhar sua rotina.",
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
  it("adds an accessory without asking for size and keeps the bag details size-free", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Bolsa Fitness" }));

    const productDialog = screen.getByRole("dialog");
    expect(within(productDialog).queryByText("Tamanho")).not.toBeInTheDocument();

    const addButton = within(productDialog).getByRole("button", { name: /Adicionar .* sacola/ });
    expect(addButton).toBeEnabled();
    fireEvent.click(addButton);

    const bag = screen.getByRole("dialog");
    expect(within(bag).queryByText(/Tamanho/)).not.toBeInTheDocument();
    expect(bag).toHaveTextContent(
      "A Diva Ativa confirma os valores, as cores disponíveis e a entrega com você pelo WhatsApp.",
    );

    const checkout = within(bag).getByRole("link", { name: "Concluir pedido no WhatsApp" });
    const message = decodeURIComponent(checkout.getAttribute("href") ?? "");
    expect(message).toContain("1x Bolsa Fitness");
    expect(message).not.toContain("1x Bolsa Fitness —");
    expect(message).not.toContain("tamanho");
    expect(message).toContain("Podem confirmar os valores, as cores disponíveis e a entrega?");
  });
});
