import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Catalog data source", () => {
  it("marks the local catalog as the source when Supabase is not configured", () => {
    render(<Catalog />);

    expect(screen.getByTestId("catalog")).toHaveAttribute("data-catalog-source", "local");
    expect(screen.getAllByRole("article")).toHaveLength(22);
  });
});
