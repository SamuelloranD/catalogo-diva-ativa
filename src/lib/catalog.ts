export const STORE_WHATSAPP = "558398794812";
import type { CatalogProduct } from "@/lib/catalog-types";

export const STORE_INSTAGRAM = "https://www.instagram.com/diva.ativamodafitness/";
export type OrderLine = {
  id: string;
  name: string;
  color?: string;
  size?: string;
  quantity: number;
  price?: number;
};

export function isAccessoryCategory(category: string) {
  return (
    category
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() === "acessorios"
  );
}

export function productAvailableSizes(product: CatalogProduct) {
  return product.sizes ?? (isAccessoryCategory(product.category) ? [] : ["P", "M", "G", "GG"]);
}

export function colorSupportsSize(product: CatalogProduct, color: string, size: string) {
  const option = product.colors?.find((item) => item.name === color);
  return Boolean(option && (!size || option.sizes === undefined || option.sizes.includes(size)));
}

export function isProductVariationAvailable(
  product: CatalogProduct,
  selection: Pick<OrderLine, "color" | "size">,
) {
  const sizes = productAvailableSizes(product);
  const colors = product.colors ?? [];
  if (sizes.length ? !selection.size || !sizes.includes(selection.size) : Boolean(selection.size)) {
    return false;
  }
  if (colors.length === 0) return !selection.color;
  if (!selection.color) return false;
  return colorSupportsSize(product, selection.color, selection.size ?? "");
}

const catalogPriceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const catalogPriceInputFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const maxCatalogPriceCents = 999999999999;

export function formatCatalogPriceInput(cents: number) {
  return catalogPriceInputFormatter.format(Math.max(0, Math.trunc(cents)) / 100);
}

export function appendCatalogPriceDigit(cents: number, digit: number) {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return cents;
  return Math.min(Math.max(0, Math.trunc(cents)) * 10 + digit, maxCatalogPriceCents);
}

export function removeCatalogPriceDigit(cents: number) {
  return Math.floor(Math.max(0, Math.trunc(cents)) / 10);
}

export function formatCatalogPrice(price?: number | null) {
  return typeof price === "number" && Number.isFinite(price)
    ? catalogPriceFormatter.format(price).replace(/\u00a0/g, " ")
    : null;
}

export function parseCatalogPrice(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;

  return Math.round(parsed * 100) / 100;
}

export function sameOrderLine(
  a: Pick<OrderLine, "id" | "size" | "color">,
  b: Pick<OrderLine, "id" | "size" | "color">,
) {
  return a.id === b.id && a.size === b.size && a.color === b.color;
}

export function addOrderLine(
  lines: OrderLine[],
  item: Omit<OrderLine, "quantity"> & { quantity?: number },
): OrderLine[] {
  const quantity = Math.max(1, Math.trunc(item.quantity ?? 1));
  const exists = lines.some((line) => sameOrderLine(line, item));
  return exists
    ? lines.map((line) =>
        sameOrderLine(line, item) ? { ...line, quantity: line.quantity + quantity } : line,
      )
    : [...lines, { ...item, quantity }];
}

export function replaceOrderLine(lines: OrderLine[], previous: OrderLine, next: OrderLine) {
  return addOrderLine(
    lines.filter((line) => !sameOrderLine(line, previous)),
    next,
  );
}
export function orderSubtotal(lines: OrderLine[]) {
  return lines.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0);
}

export function whatsappOrderText(lines: OrderLine[]) {
  const hasUnknownPrice = lines.some((line) => line.price === undefined);
  return [
    "Olá! Gostaria de consultar a disponibilidade destas peças da Diva Ativa:",
    ...lines.map((line, index) =>
      [
        "",
        `${index + 1}. ${line.name}`,
        line.color?.trim() ? `Cor: ${line.color.trim()}` : null,
        line.size?.trim() ? `Tamanho: ${line.size.trim()}` : null,
        `Quantidade: ${line.quantity}`,
        line.price === undefined
          ? "Valor sob consulta"
          : `Valor informado: ${formatCatalogPrice(line.price)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "",
    hasUnknownPrice
      ? orderSubtotal(lines) > 0
        ? `Subtotal parcial dos itens com preço: ${formatCatalogPrice(orderSubtotal(lines))}`
        : "Valores sob consulta"
      : `Subtotal estimado: ${formatCatalogPrice(orderSubtotal(lines))}`,
    "",
    "Podem confirmar a disponibilidade e me orientar sobre pagamento e entrega?",
  ].join("\n");
}

export function whatsappOrderUrl(lines: OrderLine[]) {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(whatsappOrderText(lines))}`;
}
