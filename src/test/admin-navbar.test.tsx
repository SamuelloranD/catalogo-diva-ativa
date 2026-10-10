import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
  supabase: null,
}));

import { Admin } from "@/routes/admin";

describe("Admin site navbar", () => {
  it("appears on the admin entry screen with a link back to the catalog", () => {
    render(<Admin />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).toHaveClass(
      "h-14",
      "w-14",
      "[&_svg]:size-6",
    );
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).not.toHaveTextContent(
      "Voltar ao catálogo",
    );
    expect(document.querySelector(".site-navbar-leading-action")).toHaveClass(
      "absolute",
      "left-10",
    );
    expect(screen.getByText("Seu movimento. Seu estilo.")).toBeInTheDocument();
  });
});
