import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import type { CatalogImage } from "@/lib/catalog-types";

const image: CatalogImage = {
  id: "image-1",
  productId: "product-1",
  storagePath: "product-1/image-1.jpg",
  url: "/image-1.jpg",
  position: 0,
  altText: "Imagem principal",
};

describe("Product image uploader", () => {
  function ImageUploaderHarness() {
    const [items, setItems] = useState([{ kind: "existing" as const, image }]);

    return <ProductImageUploader items={items} onItemsChange={setItems} />;
  }

  it("accepts image files and removes an existing image", () => {
    const onItemsChange = vi.fn();
    const file = new File(["image"], "nova.jpg", { type: "image/jpeg" });

    render(
      <ProductImageUploader items={[{ kind: "existing", image }]} onItemsChange={onItemsChange} />,
    );

    fireEvent.change(screen.getByLabelText("Adicionar fotos"), {
      target: { files: [file] },
    });

    expect(onItemsChange).toHaveBeenCalledWith([
      { kind: "existing", image },
      expect.objectContaining({ kind: "new", file }),
    ]);
  });

  it("previews a new image and lets the admin move it with existing images", () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:nova"),
    });

    const file = new File(["image"], "nova.jpg", { type: "image/jpeg" });
    render(<ImageUploaderHarness />);

    fireEvent.change(screen.getByLabelText("Adicionar fotos"), {
      target: { files: [file] },
    });

    expect(screen.getByAltText("nova.jpg")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mover imagem nova.jpg para cima" }));

    expect(screen.getAllByRole("img")[0]).toHaveAttribute("alt", "nova.jpg");
  });

  it("rejects files larger than 6 MB", () => {
    const onFilesChange = vi.fn();
    const file = new File([new Uint8Array(6 * 1024 * 1024 + 1)], "grande.jpg", {
      type: "image/jpeg",
    });

    render(<ProductImageUploader items={[]} onItemsChange={onFilesChange} />);

    fireEvent.change(screen.getByLabelText("Adicionar fotos"), {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("6 MB");
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("opens an image adjustment modal with an accessible zoom control", () => {
    render(<ProductImageUploader items={[{ kind: "existing", image }]} onItemsChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Ajustar imagem Imagem principal" }));

    expect(screen.getByRole("dialog", { name: "Ajustar imagem" })).toBeInTheDocument();
    const zoomControl = screen.getByRole("slider", { name: "Zoom da imagem" });
    expect(zoomControl).toHaveValue("1");

    fireEvent.change(zoomControl, { target: { value: "1.4" } });

    expect(zoomControl).toHaveValue("1.4");
  });

  it("keeps image adjustment and reorder controls symmetric", () => {
    render(<ProductImageUploader items={[{ kind: "existing", image }]} onItemsChange={vi.fn()} />);

    const adjustButton = screen.getByRole("button", {
      name: "Ajustar imagem Imagem principal",
    });
    const moveLeftButton = screen.getByRole("button", {
      name: "Mover imagem Imagem principal para cima",
    });
    const moveRightButton = screen.getByRole("button", {
      name: "Mover imagem Imagem principal para baixo",
    });

    expect(adjustButton).toHaveClass("h-9", "w-9");
    expect(moveLeftButton).toHaveClass("h-9", "w-9");
    expect(moveRightButton).toHaveClass("h-9", "w-9");
    expect(moveLeftButton.querySelector("svg")).toHaveClass("size-5");
    expect(moveRightButton.querySelector("svg")).toHaveClass("size-5");
    expect(adjustButton.parentElement).toHaveClass("justify-center", "gap-2");
    expect(adjustButton.parentElement).toBe(moveRightButton.parentElement);
  });
});
