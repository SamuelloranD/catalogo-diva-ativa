import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  list: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://images.example/site/home-banner" } })),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { storage: { from: () => storage } },
}));

import { getHeroBannerUrl, removeHeroBanner, saveHeroBanner } from "./hero-banner";

describe("Hero banner storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.list.mockResolvedValue({ data: [], error: null });
    storage.upload.mockResolvedValue({ error: null });
    storage.remove.mockResolvedValue({ error: null });
  });

  it("loads the saved banner with a cache version and falls back when absent", async () => {
    await expect(getHeroBannerUrl()).resolves.toBeNull();
    storage.list.mockResolvedValue({
      data: [{ name: "home-banner", updated_at: "2026-10-15T12:00:00Z" }],
      error: null,
    });

    await expect(getHeroBannerUrl()).resolves.toBe(
      "https://images.example/site/home-banner?v=2026-10-15T12%3A00%3A00Z",
    );
    expect(storage.getPublicUrl).toHaveBeenCalledWith("site/home-banner");
  });

  it("uploads a new image to the dedicated banner path", async () => {
    const file = new File(["image"], "banner.webp", { type: "image/webp" });

    const url = await saveHeroBanner(file);

    expect(storage.upload).toHaveBeenCalledWith(
      "site/home-banner",
      file,
      expect.objectContaining({ contentType: "image/webp", upsert: true }),
    );
    expect(url).toContain("https://images.example/site/home-banner?v=");
  });

  it("rejects unsupported files before uploading", async () => {
    await expect(
      saveHeroBanner(new File(["text"], "banner.txt", { type: "text/plain" })),
    ).rejects.toThrow("JPG, PNG, WEBP ou AVIF");
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("removes the custom banner so the default can be shown", async () => {
    await removeHeroBanner();
    expect(storage.remove).toHaveBeenCalledWith(["site/home-banner"]);
  });
});
