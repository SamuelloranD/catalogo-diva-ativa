import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Catalog } from "@/routes/index";

describe("Summi catalog products", () => {
  it("renders the mapped Summi product families", () => {
    render(<Catalog />);

    expect(screen.getByRole("button", { name: "Baby Look Tapa Bumbum" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Macaquinho Jade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Macacão Jade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Macaquinho Summi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Macacão Summi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Casaco Moviment" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Casaquinho Malha Encorpada UV" }),
    ).toBeInTheDocument();
  });

  it("limits Jade and nested Summi galleries to five images", async () => {
    render(<Catalog />);

    for (const name of ["Macaquinho Jade", "Macacão Jade", "Macaquinho Summi", "Macacão Summi"]) {
      fireEvent.click(screen.getByRole("button", { name: `Ver ${name}` }));
      await waitFor(() => {
        expect(
          screen.getAllByRole("button", { name: new RegExp(`Ver imagem \\d de ${name}`) }),
        ).toHaveLength(5);
      });
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument(),
      );
    }
  }, 15000);

  it("uses the three provided Cropped images", async () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Cropped" }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Ver imagem \d de Cropped/ })).toHaveLength(3);
    });
  });

  it("shows cropped products in the Croppeds section", () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Croppeds" }));

    expect(screen.getByRole("button", { name: "Ver Cropped" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Cropped New" })).toBeInTheDocument();
  });

  it("shows the three Casaco Moviment images", async () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Casaco Moviment" }));
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /Ver imagem \d de Casaco Moviment/ }),
      ).toHaveLength(3);
    });
  });

  it("shows the three Casaquinho Malha Encorpada UV images", async () => {
    render(<Catalog />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Casaquinho Malha Encorpada UV" }));
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", {
          name: /Ver imagem \d de Casaquinho Malha Encorpada UV/,
        }),
      ).toHaveLength(3);
    });
  });
});
