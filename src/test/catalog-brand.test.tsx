import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Catalog brand treatment", () => {
  it("uses the mint navbar, a distinct light announcement bar, and the brand logo", () => {
    render(<Catalog />);

    const navbar = screen.getByRole("banner");
    const navbarSlogan = within(navbar).getByText("Seu movimento. Seu estilo.");
    const navbarNav = navbarSlogan.parentElement;
    const announcement = screen.getByText("Pedidos pelo WhatsApp").parentElement;
    const logoLink = screen.getAllByRole("img")[0]!.parentElement;
    const bagCount = screen.getByText("0", { selector: "span" });
    const footer = screen.getByRole("contentinfo");
    const developerLink = screen.getByRole("link", { name: "POWERED BY: SAMUEL LORAND" });
    const logo = screen.getByRole("img", { name: "Diva Ativa, início" });

    expect(announcement).toHaveClass("bg-announcement", "text-foreground");
    expect(announcement).not.toHaveTextContent("Seu movimento. Seu estilo.");
    expect(navbar).toHaveClass("bg-sage", "text-primary-foreground");
    expect(navbarSlogan).toBeInTheDocument();
    expect(navbarNav).toHaveClass("absolute", "left-1/2", "-translate-x-1/2");
    expect(navbar).not.toHaveTextContent("Catálogo");
    expect(navbar).not.toHaveTextContent("Fale com a gente");
    expect(logoLink).toHaveClass("brand");
    expect(logo).toHaveClass("brand-logo");
    expect(logo).toHaveAttribute("src");
    expect(bagCount).toHaveClass("bg-background", "text-foreground");
    expect(bagCount).toHaveClass("absolute", "-right-1", "-top-1");
    expect(footer).toHaveClass("border-t", "border-border");
    expect(footer).toHaveTextContent("feito para uma diva");
    expect(footer).not.toHaveTextContent("diva ativa.");
    expect(developerLink).toHaveAttribute("href", "https://www.linkedin.com/in/samuellorand/");
  });

  it("keeps lateral spacing when opening a product image on mobile", () => {
    render(<Catalog />);

    fireEvent.click(screen.getAllByRole("button", { name: /^Ver / })[0]!);

    expect(screen.getByRole("dialog")).toHaveClass("w-[calc(100%-2rem)]", "max-w-2xl");
  });

  it("opens the bag at two-thirds width and places the item name above its larger image", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));
    fireEvent.click(screen.getByRole("button", { name: "P" }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar .* sacola/ }));

    const bag = screen.getByRole("dialog");
    const itemName = within(bag).getByRole("heading", { name: "Macaquito Ellie" });
    const itemImage = within(bag).getByRole("img", { name: "Macaquito Ellie" });

    expect(bag).toHaveClass("w-2/3", "max-w-none");
    expect(itemName).toHaveClass("cart-item-name");
    expect(itemImage).toHaveClass("cart-item-image", "h-32", "w-24");
    expect(itemName.compareDocumentPosition(itemImage)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(within(bag).getByText("Tamanho · P")).toBeInTheDocument();
    expect(within(bag).queryByText("Cores disponíveis · P")).not.toBeInTheDocument();
    expect(itemName.compareDocumentPosition(within(bag).getByText("Tamanho · P"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
