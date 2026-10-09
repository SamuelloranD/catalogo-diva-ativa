import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
  supabase: null,
}));

import { Admin } from "@/routes/admin";

describe("Admin catalog access", () => {
  it("explains how to configure Supabase when the backend is unavailable", () => {
    render(<Admin />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Administração do catálogo" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/configure o supabase/i)).toBeInTheDocument();
  });
});
