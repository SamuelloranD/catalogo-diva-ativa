import { describe, expect, it, vi } from "vitest";

const requests = vi.hoisted(() => ({ productSelect: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    from: (table: string) => {
      if (table === "products") {
        return {
          select: (columns: string) => {
            requests.productSelect(columns);
            const missingNewColumns = columns.includes("sizes,colors");
            return {
              eq: () => ({
                order: async () =>
                  missingNewColumns
                    ? { data: null, error: { code: "PGRST204", message: "Missing sizes column" } }
                    : { data: [], error: null },
              }),
            };
          },
        };
      }
      if (table === "categories") {
        return { select: () => ({ eq: async () => ({ data: [], error: null }) }) };
      }
      if (table === "product_images") {
        return { select: () => ({ order: async () => ({ data: [], error: null }) }) };
      }
      return {
        select: async () => ({ data: null, error: { code: "PGRST205", message: "Missing table" } }),
      };
    },
  },
}));

import { listProducts } from "@/lib/catalog-api";

describe("catalog API before the variations migration", () => {
  it("loads legacy products when PostgREST cannot find new columns", async () => {
    await expect(listProducts()).resolves.toEqual([]);
    expect(requests.productSelect).toHaveBeenCalledTimes(2);
  });
});
