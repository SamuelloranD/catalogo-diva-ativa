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
    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
    expect(screen.getByText("Seu movimento. Seu estilo.")).toBeInTheDocument();
  });
});
