import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
  supabase: null,
}));

import { Admin } from "@/routes/admin";

describe("Admin site navbar", () => {
  it("uses a centered desktop logo and a catalog link on the right while preserving the mobile action", () => {
    render(<Admin />);

    expect(screen.getByRole("banner")).toBeInTheDocument();

    const catalogLink = screen.getByRole("link", { name: "Voltar ao catálogo" });
    expect(catalogLink).toHaveAttribute("href", "/");
    expect(catalogLink).toHaveClass("site-navbar-admin-back-action");
    expect(catalogLink.querySelector("svg")).toHaveClass("md:hidden");
    expect(catalogLink.querySelector("span")).toHaveClass("hidden", "md:inline");

    expect(screen.queryByText("Seu movimento. Seu estilo.")).not.toBeInTheDocument();
    expect(document.querySelector(".site-navbar-logo")).toHaveClass("md:absolute", "md:left-1/2");
    expect(document.querySelector(".site-navbar-leading-action")).toHaveClass(
      "md:left-auto",
      "md:right-0",
    );
  });
});
