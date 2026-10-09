import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteNavbar } from "@/components/site-navbar";

describe("Site navbar admin access", () => {
  it("does not show the admin panel button for regular visitors", () => {
    render(<SiteNavbar />);

    expect(screen.queryByRole("link", { name: "Abrir painel admin" })).not.toBeInTheDocument();
  });

  it("shows a lock button to the admin panel for an admin session", () => {
    render(<SiteNavbar isAdmin />);

    expect(screen.getByRole("link", { name: "Abrir painel admin" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });
});
