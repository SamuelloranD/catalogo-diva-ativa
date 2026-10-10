export const STORE_WHATSAPP = "558398794812";
export const STORE_INSTAGRAM = "https://www.instagram.com/diva.ativamodafitness/";
export type OrderLine = { id: string; name: string; color: string; size: string; quantity: number };

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

export function addOrderLine(lines: OrderLine[], item: Omit<OrderLine, "quantity">): OrderLine[] {
  const exists = lines.some((line) => line.id === item.id && line.size === item.size);
  return exists
    ? lines.map((line) =>
        line.id === item.id && line.size === item.size
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      )
    : [...lines, { ...item, quantity: 1 }];
}
export function whatsappOrderUrl(lines: OrderLine[]) {
  const text = [
    "Olá, Diva Ativa! Gostaria de fazer um pedido:",
    "",
    ...lines.map((line) => `${line.quantity}x ${line.name} — ${line.color}, tamanho ${line.size}`),
    "",
    "Podem confirmar os valores e a disponibilidade?",
  ].join("\n");
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
