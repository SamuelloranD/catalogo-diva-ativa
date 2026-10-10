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
    const footerTagline = within(footer).getByText("Feito para uma diva");
    const developerLink = screen.getByRole("link", { name: "Visitar GitHub de Samuel Lorand" });
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
    expect(footer).toHaveTextContent("Feito para uma diva");
    expect(footerTagline).toHaveClass("hidden", "sm:inline");
    expect(footer).not.toHaveTextContent("diva ativa.");
    expect(developerLink).toHaveTextContent("POWERED BY: SAMUEL LORAND");
    expect(developerLink).toHaveClass(
      "inline-flex",
      "items-center",
      "gap-1",
      "hover:underline",
      "focus-visible:ring-2",
    );
    expect(developerLink).toHaveAttribute("href", "https://github.com/SamuelloranD");
  });

  it("keeps lateral spacing when opening a product image on mobile", () => {
    render(<Catalog />);

    fireEvent.click(screen.getAllByRole("button", { name: /^Ver / })[0]!);

    expect(screen.getByRole("dialog")).toHaveClass("w-[calc(100%-2rem)]", "max-w-2xl");
  });

  it("aligns product details to the top of the image modal", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));

    expect(document.querySelector(".product-dialog-details")).toHaveClass("justify-start");
    expect(document.querySelector(".product-dialog-details")).not.toHaveClass("justify-center");
  });

  it("keeps the desktop product modal and image area at fixed heights", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));

    const dialog = screen.getByRole("dialog");
    const productImage = within(dialog).getByRole("img", { name: "Macaquito Ellie" });

    expect(dialog).toHaveClass("sm:h-[720px]", "sm:max-h-[calc(100dvh-2rem)]");
    expect(productImage).toHaveClass("sm:h-[500px]", "sm:object-contain");
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
    expect(bag).toHaveClass("overflow-x-hidden", "p-4", "sm:p-6");
    expect(itemName).toHaveClass("cart-item-name");
    expect(itemImage).toHaveClass("cart-item-image", "h-32", "w-24");
    expect(itemName.compareDocumentPosition(itemImage)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(within(bag).getByText("Tamanho · P")).toBeInTheDocument();
    expect(within(bag).queryByText("Cores disponíveis · P")).not.toBeInTheDocument();
    expect(itemName.compareDocumentPosition(within(bag).getByText("Tamanho · P"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const removeButton = within(bag).getByRole("button", { name: "Remover Macaquito Ellie" });
    expect(removeButton).toHaveClass("cart-remove-button");
    expect(removeButton.parentElement).toHaveClass("cart-item-header");
    expect(removeButton.parentElement).toContainElement(itemName);
    expect(bag.querySelector(".cart-item-actions")).toHaveClass("flex-wrap");
    const checkout = within(bag).getByRole("link", { name: "Concluir pedido no WhatsApp" });
    expect(checkout).toHaveClass("whitespace-normal", "text-xs", "sm:text-sm");
    expect(within(checkout).getByText("Concluir pedido no WhatsApp")).toHaveClass(
      "cart-checkout-label",
    );
  });
});
