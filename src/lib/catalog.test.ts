import { describe, expect, it } from "vitest";
import { addOrderLine, whatsappOrderUrl } from "./catalog";
describe("Catalog orders", () => {
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
