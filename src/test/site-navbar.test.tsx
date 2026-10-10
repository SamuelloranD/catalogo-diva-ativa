import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteNavbar } from "@/components/site-navbar";
import { buttonVariants } from "@/components/ui/button";

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

  it("centers the mobile logo and anchors the action rail to both edges", () => {
    render(
      <SiteNavbar
        leftAction={<button aria-label="Buscar peças" />}
        rightAction={<button aria-label="Abrir sacola, 0 itens" />}
      />,
    );

    expect(screen.getByRole("link", { name: "Diva Ativa, início" })).toHaveClass(
      "site-navbar-logo",
      "left-1/2",
    );
    expect(document.querySelector(".site-navbar-actions")).toHaveClass(
      "absolute",
      "inset-x-10",
      "top-1/2",
      "justify-between",
    );
    expect(document.querySelector(".site-navbar-left-action")).toHaveClass("shrink-0");
    expect(document.querySelector(".site-navbar-right-action")).toHaveClass("relative", "shrink-0");
  });

  it("provides the updated shared size for mobile navbar controls", () => {
    expect(buttonVariants({ variant: "navbar", size: "navbarIcon" })).toContain("h-12 w-12");
  });

  it("adds admin without changing the fixed right action position", () => {
    render(
      <SiteNavbar
        isAdmin
        leftAction={<button aria-label="Buscar peças" />}
        rightAction={<button aria-label="Abrir sacola, 0 itens" />}
      />,
    );

    expect(screen.getByRole("link", { name: "Abrir painel admin" })).toHaveClass(
      "site-navbar-admin-action",
      "absolute",
      "right-full",
    );
    expect(document.querySelector(".site-navbar-right-action")).toHaveClass("relative");
    expect(screen.getByRole("button", { name: "Abrir sacola, 0 itens" })).toBeInTheDocument();
  });

  it("keeps the desktop admin action in flow with spacing from search", () => {
    render(
      <SiteNavbar
        isAdmin
        leftAction={<button aria-label="Buscar peças" />}
        rightAction={<button aria-label="Abrir sacola, 0 itens" />}
      />,
    );

    expect(screen.getByRole("link", { name: "Abrir painel admin" })).toHaveClass(
      "md:static",
      "md:mr-0",
    );
    expect(document.querySelector(".site-navbar-right-action")).toHaveClass("md:gap-4");
  });
});
