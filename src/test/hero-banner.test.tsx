import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const bannerApi = vi.hoisted(() => ({
  getHeroBannerUrl: vi.fn(),
  saveHeroBanner: vi.fn(),
  removeHeroBanner: vi.fn(),
}));
const contentApi = vi.hoisted(() => ({
  getHeroContent: vi.fn(),
  saveHeroContent: vi.fn(),
}));

vi.mock("@/lib/hero-banner", () => bannerApi);
vi.mock("@/lib/hero-content", () => ({
  ...contentApi,
  HERO_TEXT_LIMITS: { title: 14, highlight: 18, description: 80, buttonLabel: 18 },
  DEFAULT_HERO_CONTENT: {
    title: "Vista sua",
    highlight: "melhor versão.",
    description: "Do treino ao seu dia a dia, encontre o look que acompanha você.",
    buttonLabel: "Explorar peças",
  },
}));

import { BannerManager } from "@/components/admin/banner-manager";
import { Catalog } from "@/routes/index";

describe("Home banner", () => {
  beforeEach(() => {
    bannerApi.getHeroBannerUrl.mockResolvedValue(null);
    contentApi.getHeroContent.mockResolvedValue({
      title: "Vista sua",
      highlight: "melhor versão.",
      description: "Do treino ao seu dia a dia, encontre o look que acompanha você.",
      buttonLabel: "Explorar peças",
    });
    contentApi.saveHeroContent.mockResolvedValue(undefined);
  });

  it("shows a saved banner on the catalog home page", async () => {
    bannerApi.getHeroBannerUrl.mockResolvedValue("/banner-da-loja.jpg");
    contentApi.getHeroContent.mockResolvedValue({
      title: "Seu treino",
      highlight: "seu estilo.",
      description: "Peças para todos os dias.",
      buttonLabel: "Ver coleção",
    });
    render(<Catalog />);

    await waitFor(() =>
      expect(screen.getByAltText("Moda fitness Diva Ativa")).toHaveAttribute(
        "src",
        "/banner-da-loja.jpg",
      ),
    );
    expect(screen.getByRole("heading", { name: "Seu treino seu estilo." })).toBeInTheDocument();
    expect(screen.getByText("Peças para todos os dias.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver coleção" })).toBeInTheDocument();
  });

  it("lets the admin replace the current banner", async () => {
    bannerApi.getHeroBannerUrl.mockResolvedValue("/banner-atual.jpg");
    bannerApi.saveHeroBanner.mockResolvedValue("/banner-novo.jpg");
    render(<BannerManager />);

    expect(await screen.findByAltText("Banner atual da página principal")).toHaveAttribute(
      "src",
      "/banner-atual.jpg",
    );
    const file = new File(["image"], "novo.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Imagem do banner"), { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar banner" }));

    await waitFor(() => expect(bannerApi.saveHeroBanner).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(screen.getByAltText("Banner atual da página principal")).toHaveAttribute(
        "src",
        "/banner-novo.jpg",
      ),
    );
  });

  it("lets the admin restore the default banner", async () => {
    bannerApi.getHeroBannerUrl.mockResolvedValue("/banner-atual.jpg");
    bannerApi.removeHeroBanner.mockResolvedValue(undefined);
    render(<BannerManager />);

    fireEvent.click(await screen.findByRole("button", { name: "Restaurar imagem padrão" }));

    await waitFor(() => expect(bannerApi.removeHeroBanner).toHaveBeenCalled());
    expect(screen.getByText("Imagem padrão em uso")).toBeInTheDocument();
  });

  it("limits banner text and saves the edited copy", async () => {
    render(<BannerManager />);
    const title = await screen.findByRole("textbox", { name: "Primeira linha do título" });
    await waitFor(() => expect(title).toBeEnabled());
    fireEvent.change(title, { target: { value: "a".repeat(30) } });
    expect(title).toHaveValue("a".repeat(14));
    fireEvent.change(screen.getByRole("textbox", { name: "Destaque do título" }), {
      target: { value: "com você" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Descrição curta" }), {
      target: { value: "Seu novo look fitness." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Texto do botão" }), {
      target: { value: "Ver novidades" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar texto" }));

    await waitFor(() =>
      expect(contentApi.saveHeroContent).toHaveBeenCalledWith({
        title: "a".repeat(14),
        highlight: "com você",
        description: "Seu novo look fitness.",
        buttonLabel: "Ver novidades",
      }),
    );
  });

  it("explains when banner text settings have not been created in Supabase", async () => {
    contentApi.getHeroContent.mockRejectedValue({
      code: "PGRST205",
      message: "Could not find the table 'site_content' in the schema cache",
    });
    render(<BannerManager />);

    expect(await screen.findByRole("alert")).toHaveTextContent("20261015_home_banner_content.sql");
  });
});
