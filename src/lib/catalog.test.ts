import { describe, expect, it } from "vitest";
import {
  addOrderLine,
  appendCatalogPriceDigit,
  formatCatalogPrice,
  formatCatalogPriceInput,
  parseCatalogPrice,
  removeCatalogPriceDigit,
  whatsappOrderUrl,
} from "./catalog";
describe("Catalog orders", () => {
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
    expect(decodeURIComponent(url)).toContain("2x Conjunto — Verde, tamanho M");
  });
  it("adds matching sizes together, keeping other sizes separate", () => {
    const item = { id: "1", name: "Conjunto", color: "Verde", size: "M" };
    const lines = addOrderLine(addOrderLine([], item), item);
    expect(lines[0]?.quantity).toBe(2);
    expect(addOrderLine(lines, { ...item, size: "P" })).toHaveLength(2);
  });
});
