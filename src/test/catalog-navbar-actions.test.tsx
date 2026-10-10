import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Catalog navbar actions", () => {
  it("uses icon-only sacola controls without the Sacola label", () => {
    render(<Catalog />);

    const bagButton = screen.getByRole("button", { name: "Abrir sacola, 0 itens" });
    const quantityIndicator = bagButton.querySelector("span");

    expect(bagButton).toHaveClass("relative", "h-12", "w-12");
    expect(bagButton).not.toHaveTextContent("Sacola");
    expect(quantityIndicator).toHaveClass("absolute", "-right-1", "-top-1");
    expect(quantityIndicator).not.toHaveClass("sm:static");
  });

  it("gives categories the full horizontal row while preserving sorting", () => {
    render(<Catalog />);

    const sortButton = screen.getByRole("button", { name: /Ordenar por: Destaques/i });
    const categoriesRow = screen.getByRole("button", { name: "Todas as peças" }).parentElement;

    expect(categoriesRow).toHaveClass("w-full");
    expect(categoriesRow).not.toContainElement(sortButton);
  });

  it("keeps the unused filters action out of the catalog controls", () => {
    render(<Catalog />);

    expect(screen.queryAllByRole("button", { name: "Filtros" })).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Ordenar por: Destaques/i })).toBeInTheDocument();
  });
});
