import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Atletika catalog products", () => {
  it("renders the imported Atletika collection", () => {
    render(<Catalog />);

    expect(screen.getAllByRole("article")).toHaveLength(22);
    expect(screen.getByRole("button", { name: "Ver Macaquito Ellie" })).toBeInTheDocument();
  });

  it("shows every available image in the product detail", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));

    expect(
      screen.getAllByRole("button", { name: /Ver imagem \d de Macaquito Ellie/ }),
    ).toHaveLength(3);
  });

  it("switches to the second product image on hover and touch press", () => {
    render(<Catalog />);

    const imageButton = screen.getByRole("button", { name: "Ver Macaquito Ellie" });
    const image = within(imageButton).getByRole("img", { name: "Macaquito Ellie" });

    expect(image).toHaveAttribute("src", expect.stringContaining("/1.jpg"));

    fireEvent.mouseEnter(imageButton);
    expect(image).toHaveAttribute("src", expect.stringContaining("/2.jpg"));

    fireEvent.mouseLeave(imageButton);
    expect(image).toHaveAttribute("src", expect.stringContaining("/1.jpg"));

    fireEvent.touchStart(imageButton);
    expect(image).toHaveAttribute("src", expect.stringContaining("/2.jpg"));

    fireEvent.touchEnd(imageButton);
    expect(image).toHaveAttribute("src", expect.stringContaining("/1.jpg"));
  });

  it("aligns product names with the image and removes favorites", () => {
    render(<Catalog />);

    expect(screen.getByRole("button", { name: "Conjunto Cherry" })).toHaveClass("w-full", "px-0");
    expect(screen.queryByRole("button", { name: "Favoritos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Favoritar/ })).not.toBeInTheDocument();
  });

  it("keeps the consultation message without a color swatch", () => {
    render(<Catalog />);

    expect(screen.getAllByText("Consultar valores e cores disponíveis")).toHaveLength(22);
    expect(document.querySelectorAll(".swatch")).toHaveLength(0);
  });
});
