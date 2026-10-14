import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Catalog } from "@/routes/index";

describe("Catalog brand treatment", () => {
  it("presents the editorial hero and three purchase steps", () => {
    render(<Catalog />);
    expect(screen.getByRole("heading", { name: /Vista sua melhor versão/ })).toBeInTheDocument();
    for (const text of [
      "1. Escolha as peças",
      "2. Envie o pedido no WhatsApp",
      "3. Combine pagamento e entrega",
    ]) {
      expect(
        screen.getByText((_, node) => node?.tagName === "SPAN" && node.textContent === text),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("banner")).toHaveClass("bg-sage");
  });
  it("opens a gallery above options on mobile", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("max-h-[94dvh]");
    expect(within(dialog).getByRole("img", { name: "Macaquito Ellie" })).toHaveClass(
      "object-contain",
    );
    expect(within(dialog).getAllByRole("button", { name: /Ver imagem/ })).toHaveLength(3);
  });
  it("adds a selected size and then opens the responsive bag", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Macaquito Ellie" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "P" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Adicionar à sacola" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abrir sacola, 1 itens" }));
    const bag = screen.getByRole("dialog");
    expect(bag).toHaveClass("catalog-bag-sheet");
    expect(within(bag).getByText("Tamanho: P")).toBeInTheDocument();
    expect(within(bag).getByRole("button", { name: "Concluir pedido no WhatsApp" })).toBeEnabled();
  });
});
