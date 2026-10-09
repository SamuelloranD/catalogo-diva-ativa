import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Instagram store links", () => {
  it("renders compact Instagram links in the top bar and highlight", () => {
    render(<Catalog />);

    const links = screen.getAllByRole("link", { name: /instagram/i });
    const whatsappLink = screen.getByRole("link", { name: /pedidos pelo whatsapp/i });
    const highlightWhatsappLink = screen.getByRole("link", { name: /^whatsapp$/i });
    const announcement = screen.getByText("Pedidos pelo WhatsApp").parentElement;
    const footer = screen.getByRole("contentinfo");

    expect(links).toHaveLength(2);
    expect(whatsappLink).toHaveClass("h-6", "px-2");
    expect(whatsappLink).toHaveAttribute("href", "https://wa.me/558398794812");
    expect(highlightWhatsappLink).toHaveClass("h-8", "px-3", "text-xs");
    expect(highlightWhatsappLink).toHaveAttribute("href", "https://wa.me/558398794812");
    expect(links[0]).toHaveClass("h-6", "px-2");
    expect(links[1]).toHaveClass("h-8", "px-3", "text-xs");
    expect(announcement?.textContent?.match(/\|/g)).toHaveLength(1);
    expect(announcement).not.toHaveTextContent("Seu movimento. Seu estilo.");
    expect(footer).not.toHaveTextContent("Instagram da loja");
    for (const link of links) {
      expect(link).toHaveAttribute("href", "https://www.instagram.com/diva.ativamodafitness/");
    }
  });
});
