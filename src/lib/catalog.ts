export const STORE_WHATSAPP = "558398794812";
export const STORE_INSTAGRAM = "https://www.instagram.com/diva.ativamodafitness/";
export type OrderLine = { id: string; name: string; color: string; size: string; quantity: number };
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
