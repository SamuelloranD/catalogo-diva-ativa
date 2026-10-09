import { render, screen, within } from "@testing-library/react";
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
    expect(footer).toHaveClass("border-t", "border-border");
    expect(footer).toHaveTextContent("feito para uma diva");
    expect(footer).not.toHaveTextContent("diva ativa.");
    expect(developerLink).toHaveAttribute("href", "https://www.linkedin.com/in/samuellorand/");
  });
});
