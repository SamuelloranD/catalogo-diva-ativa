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
});
