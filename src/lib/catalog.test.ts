import { describe, expect, it } from "vitest";
import {
  addOrderLine,
  appendCatalogPriceDigit,
  colorSupportsSize,
  formatCatalogPrice,
  formatCatalogPriceInput,
  parseCatalogPrice,
  isProductVariationAvailable,
  removeCatalogPriceDigit,
  replaceOrderLine,
  whatsappOrderText,
  whatsappOrderUrl,
} from "./catalog";
describe("Catalog orders", () => {
  it("allows only configured color and size pairs while preserving legacy colors", () => {
    const product = {
      id: "set-1",
      name: "Conjunto",
      brand: "Diva Ativa",
      category: "Conjuntos",
      color: "",
      images: [],
      tag: "",
      description: "",
      sizes: ["P", "G"],
      colors: [
        { name: "Verde", sizes: ["P"] },
        { name: "Rosa", sizes: ["G"] },
      ],
    };
    expect(colorSupportsSize(product, "Verde", "P")).toBe(true);
    expect(colorSupportsSize(product, "Rosa", "P")).toBe(false);
    expect(isProductVariationAvailable(product, { color: "Verde", size: "G" })).toBe(false);
    expect(isProductVariationAvailable(product, { color: "Rosa", size: "G" })).toBe(true);
    expect(colorSupportsSize({ ...product, colors: [{ name: "Verde" }] }, "Verde", "G")).toBe(true);
  });

  it("formats a product price as Brazilian currency with two decimal places", () => {
    expect(formatCatalogPrice(129.9)).toBe("R$ 129,90");
  });

  it("does not render a currency value when the product has no price", () => {
    expect(formatCatalogPrice(undefined)).toBeNull();
  });

  it("parses an empty product price as undefined", () => {
    expect(parseCatalogPrice("")).toBeUndefined();
  });

  it("shifts typed price digits from cents to reais", () => {
    let cents = 0;
    cents = appendCatalogPriceDigit(cents, 1);
    expect(formatCatalogPriceInput(cents)).toBe("0,01");
    cents = appendCatalogPriceDigit(cents, 2);
    expect(formatCatalogPriceInput(cents)).toBe("0,12");
    cents = appendCatalogPriceDigit(cents, 9);
    expect(formatCatalogPriceInput(cents)).toBe("1,29");
    expect(formatCatalogPriceInput(removeCatalogPriceDigit(cents))).toBe("0,12");
  });

  it("uses the exact supplied store number", () => {
    expect(whatsappOrderUrl([]).split("?")[0]).toBe("https://wa.me/558398794812");
  });
  it("includes selected clothing and size in WhatsApp order", () => {
    const url = whatsappOrderUrl([
      { id: "1", name: "Conjunto", color: "Verde", size: "M", quantity: 2 },
    ]);
    expect(decodeURIComponent(url)).toContain("Cor: Verde\nTamanho: M\nQuantidade: 2");
  });
  it("formats an accessory order without color or size and asks to confirm available colors", () => {
    const url = whatsappOrderUrl([{ id: "2", name: "Bolsa", color: "", size: "", quantity: 1 }]);

    expect(decodeURIComponent(url)).toContain("1. Bolsa");
    expect(decodeURIComponent(url)).not.toContain("Tamanho:");
    expect(decodeURIComponent(url)).not.toContain("Cor:");
    expect(decodeURIComponent(url)).toContain("Valor sob consulta");
  });

  it("adds matching sizes together, keeping other sizes separate", () => {
    const item = { id: "1", name: "Conjunto", color: "Verde", size: "M" };
    const lines = addOrderLine(addOrderLine([], item), item);
    expect(lines[0]?.quantity).toBe(2);
    expect(addOrderLine(lines, { ...item, size: "P" })).toHaveLength(2);
  });
  it("keeps colors separate, merges an identical variation, and includes prices", () => {
    const wine = { id: "1", name: "Macacão", color: "Vinho", size: "M", price: 149.3 };
    const black = { ...wine, color: "Preto" };
    const lines = addOrderLine(addOrderLine(addOrderLine([], wine), black), {
      ...wine,
      quantity: 2,
    });
    expect(lines).toHaveLength(2);
    expect(lines[0]?.quantity).toBe(3);
    expect(decodeURIComponent(whatsappOrderUrl(lines))).toContain("Subtotal estimado: R$ 597,20");
  });
  it("uses a partial subtotal when any price is under consultation", () => {
    const text = whatsappOrderText([
      { id: "a", name: "Conjunto", size: "M", quantity: 2, price: 50 },
      { id: "b", name: "Regata", quantity: 1 },
    ]);
    expect(text).toContain("Subtotal parcial dos itens com preço: R$ 100,00");
    expect(text).toContain("Valor sob consulta");
    expect(text).not.toMatch(/undefined|null/);
  });
  it("merges lines when a variation is changed to an existing combination", () => {
    const first = { id: "a", name: "Peça", color: "Preto", size: "M", quantity: 1 };
    const second = { ...first, color: "Vinho", quantity: 2 };
    expect(replaceOrderLine([first, second], second, { ...second, color: "Preto" })).toEqual([
      { ...first, quantity: 3 },
    ]);
  });
});
