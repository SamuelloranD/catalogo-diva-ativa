import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => false,
  supabase: null,
}));

import { isSupabaseConfigured, listCategories } from "@/lib/catalog-api";

describe("catalog API configuration", () => {
  it("reports when Supabase is not configured locally", () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("fails clearly instead of attempting a remote query without Supabase", async () => {
    await expect(listCategories()).rejects.toThrow("Supabase is not configured");
  });
});
