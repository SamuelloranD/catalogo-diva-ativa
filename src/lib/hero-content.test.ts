import { beforeEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({ read: vi.fn(), update: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: queries.read }) }),
      update: (value: unknown) => ({ eq: () => queries.update(value) }),
    }),
  },
}));

import { getHeroContent, saveHeroContent } from "./hero-content";

describe("Hero text content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queries.read.mockResolvedValue({
      data: {
        title: "Vista sua",
        highlight: "melhor versão.",
        description: "Do treino ao seu dia a dia, encontre o look que acompanha você.",
        button_label: "Explorar peças",
      },
      error: null,
    });
    queries.update.mockResolvedValue({ error: null });
  });

  it("loads the saved title and description", async () => {
    await expect(getHeroContent()).resolves.toEqual({
      title: "Vista sua",
      highlight: "melhor versão.",
      description: "Do treino ao seu dia a dia, encontre o look que acompanha você.",
      buttonLabel: "Explorar peças",
    });
  });

  it("saves trimmed text", async () => {
    await saveHeroContent({
      title: "  Treine  ",
      highlight: " com estilo ",
      description: "  Peças para acompanhar você.  ",
      buttonLabel: "  Conhecer peças  ",
    });
    expect(queries.update).toHaveBeenCalledWith({
      title: "Treine",
      highlight: "com estilo",
      description: "Peças para acompanhar você.",
      button_label: "Conhecer peças",
    });
  });

  it("rejects text that exceeds the mobile and desktop limits", async () => {
    await expect(
      saveHeroContent({
        title: "a".repeat(15),
        highlight: "Estilo",
        description: "Descrição",
        buttonLabel: "Ver peças",
      }),
    ).rejects.toThrow("14 caracteres");
    expect(queries.update).not.toHaveBeenCalled();
  });
});
