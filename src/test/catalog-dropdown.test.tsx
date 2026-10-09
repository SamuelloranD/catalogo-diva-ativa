import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Catalog sorting dropdown", () => {
  it("opens the custom menu and applies a sorting option", () => {
    render(<Catalog />);

    const trigger = screen.getByRole("button", { name: /Ordenar por: Destaques/i });

    expect(trigger).toHaveClass("min-w-56", "max-w-none");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(screen.getByRole("menuitemradio", { name: "Novidades" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitemradio", { name: "Novidades" }));

    expect(screen.getByRole("button", { name: /Ordenar por: Novidades/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitemradio", { name: "Novidades" })).not.toBeInTheDocument();
  });
});
