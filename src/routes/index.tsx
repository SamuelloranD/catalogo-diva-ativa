import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  Instagram,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogDropdown } from "@/components/ui/catalog-dropdown";
import { SiteNavbar } from "@/components/site-navbar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  addOrderLine,
  colorSupportsSize,
  formatCatalogPrice,
  isProductVariationAvailable,
  isSoldOut,
  orderSubtotal,
  productAvailableSizes,
  replaceOrderLine,
  sameOrderLine,
  whatsappOrderText,
  whatsappOrderUrl,
  STORE_INSTAGRAM,
  STORE_WHATSAPP,
  type OrderLine,
} from "@/lib/catalog";
import { CATALOG_SIZE_OPTIONS, type CatalogProduct } from "@/lib/catalog-types";
import { getAdminSession } from "@/lib/admin-auth";
import { getHeroBannerUrl } from "@/lib/hero-banner";
import { DEFAULT_HERO_CONTENT, getHeroContent } from "@/lib/hero-content";
import { supabase } from "@/lib/supabase";
import { useCatalog } from "@/hooks/use-catalog";
import blusaBabyLook1 from "@/assets/atletika/blusa-baby-look-com-bolsos/1.jpg";
import blusaBabyLook2 from "@/assets/atletika/blusa-baby-look-com-bolsos/2.jpg";
import blusaBabyLook3 from "@/assets/atletika/blusa-baby-look-com-bolsos/3.jpg";
import conjuntoCherry1 from "@/assets/atletika/conjunto-cherry/1.jpg";
import conjuntoCherry2 from "@/assets/atletika/conjunto-cherry/2.jpg";
import conjuntoCherry3 from "@/assets/atletika/conjunto-cherry/3.jpg";
import conjuntoKimi1 from "@/assets/atletika/conjunto-kimi/1.jpg";
import conjuntoKimi2 from "@/assets/atletika/conjunto-kimi/2.jpg";
import conjuntoKimi3 from "@/assets/atletika/conjunto-kimi/3.jpg";
import conjuntoLayane1 from "@/assets/atletika/conjunto-layane/1.jpg";
import conjuntoLayane2 from "@/assets/atletika/conjunto-layane/2.jpg";
import conjuntoLayane3 from "@/assets/atletika/conjunto-layane/3.jpg";
import conjuntoPerla1 from "@/assets/atletika/conjunto-perla/1.jpg";
import conjuntoPerla2 from "@/assets/atletika/conjunto-perla/2.jpg";
import macacaoMarta1 from "@/assets/atletika/macacao-marta/1.jpg";
import macacaoMarta2 from "@/assets/atletika/macacao-marta/2.jpg";
import macacaoMarta3 from "@/assets/atletika/macacao-marta/3.jpg";
import macaquitoEllie1 from "@/assets/atletika/macaquito-ellie/1.jpg";
import macaquitoEllie2 from "@/assets/atletika/macaquito-ellie/2.jpg";
import macaquitoEllie3 from "@/assets/atletika/macaquito-ellie/3.jpg";
import macaquitoHelena1 from "@/assets/atletika/macaquito-helena/1.jpg";
import macaquitoHelena2 from "@/assets/atletika/macaquito-helena/2.jpg";
import macaquitoHelena3 from "@/assets/atletika/macaquito-helena/3.jpg";
import paymentMethodsImage from "@/assets/payment-methods.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diva Ativa | Catálogo de moda fitness" },
      {
        name: "description",
        content:
          "Encontre seu próximo look fitness na Diva Ativa. Escolha suas peças e faça seu pedido pelo WhatsApp.",
      },
      { property: "og:title", content: "Diva Ativa | Moda em movimento" },
      {
        property: "og:description",
        content: "Conjuntos, macaquinhos, croppeds e saias. Seu próximo look fitness está aqui.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});
type Product = CatalogProduct;

function PaymentTerms() {
  return (
    <div className="text-[11px] font-semibold leading-4 text-primary">
      <p>3 X sem juros</p>
      <p>5% de desconto no PIX</p>
    </div>
  );
}

const atletikaProducts: Product[] = [
  {
    id: "atletika-macaquito-ellie",
    name: "Macaquito Ellie",
    brand: "Atletika",
    category: "Macaquinhos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [macaquitoEllie1, macaquitoEllie2, macaquitoEllie3],
    tag: "",
    description: "Macaquito Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-conjunto-perla",
    name: "Conjunto Perla",
    brand: "Atletika",
    category: "Conjuntos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [conjuntoPerla1, conjuntoPerla2],
    tag: "",
    description: "Conjunto Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-conjunto-layane",
    name: "Conjunto Layane",
    brand: "Atletika",
    category: "Conjuntos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [conjuntoLayane1, conjuntoLayane2, conjuntoLayane3],
    tag: "",
    description: "Conjunto Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-macacao-marta",
    name: "Macacão Marta",
    brand: "Atletika",
    category: "Macacões",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [macacaoMarta1, macacaoMarta2, macacaoMarta3],
    tag: "",
    description: "Macacão Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-conjunto-cherry",
    name: "Conjunto Cherry",
    brand: "Atletika",
    category: "Conjuntos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [conjuntoCherry1, conjuntoCherry2, conjuntoCherry3],
    tag: "",
    description: "Conjunto Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-macaquito-helena",
    name: "Macaquito Helena",
    brand: "Atletika",
    category: "Macaquinhos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [macaquitoHelena1, macaquitoHelena2, macaquitoHelena3],
    tag: "",
    description: "Macaquito Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-blusa-baby-look-com-bolsos",
    name: "Blusa Baby Look com Bolsos",
    brand: "Atletika",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [blusaBabyLook1, blusaBabyLook2, blusaBabyLook3],
    tag: "",
    description: "Blusa Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
  {
    id: "atletika-conjunto-kimi",
    name: "Conjunto Kimi",
    brand: "Atletika",
    category: "Conjuntos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [conjuntoKimi1, conjuntoKimi2, conjuntoKimi3],
    tag: "",
    description: "Conjunto Atletika. Consulte cores, tamanhos e disponibilidade pelo WhatsApp.",
  },
];
const summiProducts: Product[] = [
  {
    id: "summi-blusa-baby-look-tapa-bumbum",
    name: "Baby Look Tapa Bumbum",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-baby-look-tapa-bumbum/1.jpg",
      "/summi/blusa-baby-look-tapa-bumbum/2.jpg",
      "/summi/blusa-baby-look-tapa-bumbum/3.jpg",
      "/summi/blusa-baby-look-tapa-bumbum/4.jpg",
      "/summi/blusa-baby-look-tapa-bumbum/5.jpg",
      "/summi/blusa-baby-look-tapa-bumbum/6.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-trend",
    name: "Trend",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: ["/summi/blusa-trend/1.webp", "/summi/blusa-trend/2.webp", "/summi/blusa-trend/3.webp"],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-regatao",
    name: "Regatão",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-regatao/1.jpg",
      "/summi/blusa-regatao/2.jpg",
      "/summi/blusa-regatao/3.jpg",
      "/summi/blusa-regatao/4.jpg",
      "/summi/blusa-regatao/5.jpg",
      "/summi/blusa-regatao/6.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-regata",
    name: "Regata",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-regata/1.jpg",
      "/summi/blusa-regata/2.jpg",
      "/summi/blusa-regata/3.jpg",
      "/summi/blusa-regata/4.jpg",
      "/summi/blusa-regata/5.jpg",
      "/summi/blusa-regata/6.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-cropped-new",
    name: "Cropped New",
    brand: "Summi",
    category: "Croppeds",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-cropped-new/1.jpg",
      "/summi/blusa-cropped-new/2.jpg",
      "/summi/blusa-cropped-new/3.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-morcego",
    name: "Morcego",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: ["/summi/blusa-morcego/1.jpg", "/summi/blusa-morcego/2.jpg"],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-cropped",
    name: "Cropped",
    brand: "Summi",
    category: "Croppeds",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-cropped/1.jpg",
      "/summi/blusa-cropped/2.jpg",
      "/summi/blusa-cropped/3.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-blusa-baby-look",
    name: "Baby Look",
    brand: "Summi",
    category: "Blusas",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/blusa-baby-look/1.jpg",
      "/summi/blusa-baby-look/2.jpg",
      "/summi/blusa-baby-look/3.jpg",
      "/summi/blusa-baby-look/4.jpg",
      "/summi/blusa-baby-look/5.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-macacao-jade",
    name: "Macacão Jade",
    brand: "Summi",
    category: "Macacões",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/macacao-jade/1.jpg",
      "/summi/macacao-jade/2.jpg",
      "/summi/macacao-jade/3.jpg",
      "/summi/macacao-jade/4.jpg",
      "/summi/macacao-jade/5.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-macaquinho-jade",
    name: "Macaquinho Jade",
    brand: "Summi",
    category: "Macaquinhos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/macaquinho-jade/1.jpg",
      "/summi/macaquinho-jade/2.jpg",
      "/summi/macaquinho-jade/3.jpg",
      "/summi/macaquinho-jade/4.jpg",
      "/summi/macaquinho-jade/5.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-macaquinho-summi",
    name: "Macaquinho Summi",
    brand: "Summi",
    category: "Macaquinhos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/macaquinho-summi/1.jpg",
      "/summi/macaquinho-summi/2.jpg",
      "/summi/macaquinho-summi/3.jpg",
      "/summi/macaquinho-summi/4.jpg",
      "/summi/macaquinho-summi/5.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-macacao-summi",
    name: "Macacão Summi",
    brand: "Summi",
    category: "Macacões",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/macacao-summi/3.png",
      "/summi/macacao-summi/1.jpg",
      "/summi/macacao-summi/2.png",
      "/summi/macacao-summi/4.jpg",
      "/summi/macacao-summi/5.jpg",
    ],
    tag: "",
    description: "Peça Summi. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-casaco-moviment",
    name: "Casaco Moviment",
    brand: "Summi",
    category: "Casacos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/casaco-moviment/1.jpg",
      "/summi/casaco-moviment/2.jpg",
      "/summi/casaco-moviment/3.jpg",
    ],
    tag: "",
    description: "Casaco Moviment. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
  {
    id: "summi-casaquinho-malha-encorpada-uv",
    name: "Casaquinho Malha Encorpada UV",
    brand: "Summi",
    category: "Casaquinhos",
    color: "Cores disponíveis",
    swatch: "sage",
    images: [
      "/summi/casaquinho-malha-encorpada-uv/1.jpg",
      "/summi/casaquinho-malha-encorpada-uv/2.jpg",
      "/summi/casaquinho-malha-encorpada-uv/3.jpg",
    ],
    tag: "",
    description:
      "Casaquinho de malha encorpada com proteção UV. Consulte valores, cores e tamanhos disponíveis pelo WhatsApp.",
  },
];
const products: Product[] = [...atletikaProducts, ...summiProducts];
const categories = [
  "Todas as peças",
  "Conjuntos",
  "Macaquinhos",
  "Macacões",
  "Blusas",
  "Croppeds",
  "Saias",
  "Casacos",
  "Casaquinhos",
];

type ProductImageButtonProps = {
  product: Product;
  loading: "eager" | "lazy";
  onSelect: () => void;
};

function ProductImageButton({ product, loading, onSelect }: ProductImageButtonProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const previewImage = product.images[1] ?? product.images[0];
  const hasAlternateImage = product.images.length > 1;

  function startPreview() {
    if (hasAlternateImage) setIsPreviewing(true);
  }

  function stopPreview() {
    setIsPreviewing(false);
  }

  return (
    <Button
      variant="image"
      className="block h-auto w-full p-0"
      aria-label={`Ver ${product.name}`}
      onClick={onSelect}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onTouchStart={startPreview}
      onTouchEnd={stopPreview}
      onTouchCancel={stopPreview}
    >
      {product.images[0] && !imageFailed ? (
        <img
          src={isPreviewing ? previewImage : product.images[0]}
          alt={product.name}
          width={768}
          height={1024}
          loading={loading}
          onError={() => setImageFailed(true)}
          className="product-photo"
        />
      ) : (
        <span className="product-photo flex items-center justify-center bg-muted text-xs text-muted-foreground">
          Fotografia indisponível
        </span>
      )}
    </Button>
  );
}

export function Catalog() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(macacaoMarta1);
  const [heroContent, setHeroContent] = useState(DEFAULT_HERO_CONTENT);
  const [category, setCategory] = useState("Todas as peças");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const [cart, setCart] = useState<OrderLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getHeroBannerUrl()
      .then((url) => {
        if (mounted && url) setHeroImageUrl(url);
      })
      .catch(() => {
        // Keep the bundled image when the banner service is unavailable.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    void getHeroContent()
      .then((content) => {
        if (mounted) setHeroContent(content);
      })
      .catch(() => {
        // Keep the bundled text when site settings are unavailable.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const syncAdminStatus = () => {
      void getAdminSession().then((session) => {
        if (mounted) setIsAdmin(Boolean(session));
      });
    };

    syncAdminStatus();
    const subscription = supabase?.auth.onAuthStateChange(syncAdminStatus).data.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const catalog = useCatalog(products, categories);
  const visible = catalog.products
    .filter(
      (p) =>
        (category === "Todas as peças" || (p.categories ?? [p.category]).includes(category)) &&
        `${p.name} ${p.description} ${(p.categories ?? [p.category]).join(" ")}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "new"
          ? Number(Boolean(b.tag === "NOVO")) - Number(Boolean(a.tag === "NOVO"))
          : 0,
    );
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  const hasUnknownPrice = cart.some((line) => line.price === undefined);
  function select(p: Product) {
    setSelected(p);
    setSelectedImageIndex(0);
    setSize("");
    setColor(p.colors?.length === 1 ? (p.colors[0]?.name ?? "") : "");
    setQuantity(1);
  }
  function changeQuantity(line: OrderLine, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (sameOrderLine(l, line) ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }
  const selectedSizes = selected ? productAvailableSizes(selected) : [];
  const displayedSizes = [
    ...CATALOG_SIZE_OPTIONS,
    ...selectedSizes.filter((option) => !CATALOG_SIZE_OPTIONS.some((size) => size === option)),
  ];
  const selectedColors = selected?.colors ?? [];
  const canAdd = selected && isProductVariationAvailable(selected, { size, color });
  function sendOrder() {
    setCopyFallback(false);
    const popup = window.open(whatsappOrderUrl(cart), "_blank");
    if (popup) popup.opener = null;
    if (!popup) setCopyFallback(true);
  }
  function lineIsUnavailable(line: OrderLine) {
    const product = catalog.products.find((item) => item.id === line.id);
    if (!product) return catalog.source === "remote";
    return !isProductVariationAvailable(product, line);
  }
  return (
    <>
      <SiteNavbar
        isAdmin={isAdmin}
        rightAction={
          <div className="flex items-center gap-3">
            <label className="hidden items-center gap-2 rounded-md border border-white/30 bg-white/15 px-3 text-primary-foreground lg:flex">
              <Search className="size-4" />
              <input
                aria-label="Buscar produtos"
                placeholder="Buscar produtos..."
                className="h-10 w-52 bg-transparent text-xs outline-none placeholder:text-white/75"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Button
              variant="navbar"
              size="navbarIcon"
              className="relative [&_svg]:size-5"
              aria-label={`Abrir sacola, ${count} itens`}
              onClick={() => setBagOpen(true)}
            >
              <ShoppingBag />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[11px] text-foreground">
                {count}
              </span>
            </Button>
          </div>
        }
      />
      <main
        data-testid="catalog"
        data-catalog-source={catalog.source}
        className="mx-auto max-w-[1440px] px-4 pb-20 pt-5 sm:px-6 lg:px-14"
      >
        <section className="catalog-hero relative isolate mb-5 overflow-hidden rounded-md bg-secondary">
          <img
            src={heroImageUrl}
            alt="Moda fitness Diva Ativa"
            className="absolute inset-0 h-full w-full object-cover object-[60%_30%]"
          />
          <div className="catalog-hero-shade absolute inset-0" />
          <div className="relative max-w-[75%] px-6 py-10 sm:max-w-[58%] sm:px-10 sm:py-14">
            <h1 className="catalog-heading">
              {heroContent.title} <em>{heroContent.highlight}</em>
            </h1>
            <p className="mt-4 max-w-xs text-xs leading-5 text-muted-foreground sm:text-sm">
              {heroContent.description}
            </p>
            <Button
              className="mt-5"
              onClick={() =>
                document.getElementById("pecas")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {heroContent.buttonLabel}
            </Button>
          </div>
        </section>
        <div className="catalog-steps mb-7 grid grid-cols-1 gap-3 border-b py-4 text-xs sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-primary" />
            <span>
              <strong>1.</strong> Escolha as peças
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="text-primary" />
            <span>
              <strong>2.</strong> Envie o pedido no WhatsApp
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="text-primary" />
            <span>
              <strong>3.</strong> Combine pagamento e entrega
            </span>
          </div>
        </div>
        <div id="pecas" className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">
              Diva Ativa · Moda Fitness
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">Encontre seu próximo look</h2>
          </div>
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-secondary/70 px-4 py-2.5 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 lg:hidden">
          <Search size={18} aria-hidden="true" className="shrink-0 text-primary/70" />
          <input
            aria-label="Buscar no catálogo"
            placeholder="Buscar produtos ou categorias..."
            className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Limpar busca"
              className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => setQuery("")}
            >
              <X />
            </Button>
          )}
        </div>
        <div className="w-full border-b">
          <div className="flex w-full min-w-0 gap-6 overflow-x-auto whitespace-nowrap sm:gap-8">
            {catalog.categories.map((c) => (
              <Button
                key={c}
                variant="catalogTab"
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                }}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex min-h-16 items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>
            {visible.length} {visible.length === 1 ? "peça" : "peças"}
          </span>
          <div className="flex items-center gap-2">
            <CatalogDropdown
              label="Ordenar por"
              value={sort}
              onValueChange={setSort}
              options={[
                { value: "featured", label: "Destaques" },
                { value: "new", label: "Novidades" },
                { value: "name", label: "Nome: A a Z" },
              ]}
            />
          </div>
        </div>
        {catalog.loading && (
          <p role="status" className="mb-4 text-sm">
            Carregando catálogo...
          </p>
        )}
        {catalog.error && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            Não foi possível atualizar o catálogo. Exibindo peças disponíveis nesta versão.
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {visible.map((p, i) => {
            const formattedPrice = formatCatalogPrice(p.price);

            return (
              <article key={p.id} className="flex h-full min-w-0 flex-col">
                <div className="product-image relative overflow-hidden rounded-sm bg-muted">
                  <ProductImageButton
                    product={p}
                    loading={i === 0 ? "eager" : "lazy"}
                    onSelect={() => select(p)}
                  />
                  {p.tag && (
                    <span className="absolute left-3 top-3 bg-product-tag px-2.5 py-1.5 text-[8px] font-medium text-product-tag-foreground sm:text-[9px]">
                      {isSoldOut(p) ? "Esgotado" : p.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col pt-3">
                  <p className="mb-1.5 text-[10px] text-muted-foreground">{p.category}</p>
                  <Button variant="productName" className="w-full px-0" onClick={() => select(p)}>
                    {p.name}
                  </Button>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {formattedPrice ?? "Valor sob consulta"}
                  </p>
                  <div
                    className="mt-auto flex min-h-6 items-center gap-1.5 pt-2"
                    aria-label={
                      p.colors?.length
                        ? `Cores: ${p.colors.map((c) => c.name).join(", ")}`
                        : undefined
                    }
                  >
                    {p.colors?.slice(0, 4).map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: c.hex ?? "transparent" }}
                      />
                    ))}
                    {(p.colors?.length ?? 0) > 4 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{(p.colors?.length ?? 0) - 4}
                      </span>
                    )}
                  </div>
                  <Button className="mt-3 h-8 w-full text-xs" onClick={() => select(p)}>
                    Escolher opções
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
        {visible.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display text-3xl">Novos movimentos estão chegando.</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Não encontramos peças nesta seleção.
            </p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => {
                setCategory("Todas as peças");
                setQuery("");
              }}
            >
              Ver todas as peças
            </Button>
          </div>
        )}
        <div className="mt-14 grid items-center gap-x-6 gap-y-6 border-y py-7 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center gap-4">
            <MessageCircle className="text-primary" size={24} />
            <div>
              <h2 className="font-display text-25px text-2xl">Um toque de cuidado, de perto.</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Fale com a Diva Ativa e encontre seu próximo look.
              </p>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-2">
            <p className="text-xs font-semibold text-foreground">Formas de pagamento</p>
            <img
              src={paymentMethodsImage}
              alt="Bandeiras das formas de pagamento aceitas"
              width={539}
              height={51}
              loading="lazy"
              className="h-auto w-full"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-self-end">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer">
                <Instagram /> Instagram
              </a>
            </Button>
          </div>
        </div>
      </main>
      <footer className="mx-auto mt-8 flex max-w-[1440px] flex-col items-center justify-between gap-4 border-t border-border px-6 pb-8 pt-7 text-xs text-muted-foreground sm:flex-row lg:px-14">
        <span>© 2026 Diva Ativa. Moda em movimento.</span>
        <a
          href="https://github.com/SamuelloranD"
          target="_blank"
          rel="noreferrer"
          aria-label="Visitar GitHub de Samuel Lorand"
          className="inline-flex items-center gap-1 uppercase transition-colors hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          POWERED BY: SAMUEL LORAND
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
        <span className="hidden sm:inline">Feito para uma diva.</span>
      </footer>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          closeLabel="Fechar produto"
          className="max-h-[94dvh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto p-4 sm:max-h-[90dvh] sm:p-7"
        >
          {selected && (
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
              <div className="min-w-0 space-y-2">
                <div className="relative overflow-hidden rounded-md bg-muted">
                  {selected.images.length ? (
                    <img
                      src={selected.images[selectedImageIndex] ?? selected.images[0]}
                      alt={selected.name}
                      width={768}
                      height={1024}
                      className="h-[250px] w-full object-contain sm:h-[440px]"
                    />
                  ) : (
                    <div className="flex h-[310px] items-center justify-center text-sm text-muted-foreground">
                      Fotografia indisponível
                    </div>
                  )}
                  {selected.images.length > 1 && (
                    <>
                      <Button
                        variant="photoIcon"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        aria-label="Imagem anterior"
                        onClick={() =>
                          setSelectedImageIndex(
                            (current) =>
                              (current - 1 + selected.images.length) % selected.images.length,
                          )
                        }
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="photoIcon"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        aria-label="Próxima imagem"
                        onClick={() =>
                          setSelectedImageIndex((current) => (current + 1) % selected.images.length)
                        }
                      >
                        <ChevronRight />
                      </Button>
                    </>
                  )}
                </div>
                {selected.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.images.map((image, imageIndex) => (
                      <button
                        key={image}
                        type="button"
                        aria-label={`Ver imagem ${imageIndex + 1} de ${selected.name}`}
                        aria-pressed={selectedImageIndex === imageIndex}
                        onClick={() => setSelectedImageIndex(imageIndex)}
                        className={`w-14 shrink-0 overflow-hidden rounded-sm border-2 transition-colors ${
                          selectedImageIndex === imageIndex
                            ? "border-primary"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          width={160}
                          height={210}
                          className="aspect-[3/4] w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="product-dialog-details flex flex-col justify-start">
                <p className="mb-2 text-xs text-muted-foreground">{selected.category}</p>
                <DialogTitle className="font-display text-4xl font-normal">
                  {selected.name}
                </DialogTitle>
                {selected.description && (
                  <DialogDescription className="mt-3 leading-6">
                    {selected.description}
                  </DialogDescription>
                )}
                <div className="mt-4 border-b pb-4">
                  <p className="text-xl font-semibold">
                    {formatCatalogPrice(selected.price) ?? "Valor sob consulta"}
                  </p>
                  <div className="mt-2">
                    <PaymentTerms />
                  </div>
                </div>
                {selectedColors.length > 0 && (
                  <fieldset className="mt-4">
                    <legend className="mb-2 text-xs font-semibold">
                      {selectedColors.length === 1 ? "Cor" : "Cores disponíveis"}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((option) => (
                        <Button
                          key={option.name}
                          type="button"
                          variant="colorOption"
                          aria-pressed={color === option.name}
                          aria-label={`Cor ${option.name}${size && !colorSupportsSize(selected, option.name, size) ? " indisponível" : ""}`}
                          disabled={Boolean(
                            size && !colorSupportsSize(selected, option.name, size),
                          )}
                          className="catalog-color-option h-auto min-h-16 w-20 flex-col gap-2 whitespace-normal rounded-none p-1 text-center text-[11px] leading-tight"
                          onClick={() =>
                            setColor((current) =>
                              current === option.name && selectedColors.length > 1
                                ? ""
                                : option.name,
                            )
                          }
                        >
                          <span
                            className="catalog-color-swatch shrink-0"
                            aria-hidden="true"
                            style={{ backgroundColor: option.hex ?? "transparent" }}
                          />
                          <span>{option.name}</span>
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {selectedSizes.length > 0 && (
                  <fieldset className="mt-5">
                    <legend className="mb-2 text-xs font-semibold">
                      Tamanho{" "}
                      <span className="font-normal text-muted-foreground">· escolha uma opção</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {displayedSizes.map((option) => {
                        const available =
                          selectedSizes.includes(option) &&
                          (!color || colorSupportsSize(selected, color, option));
                        return (
                          <Button
                            key={option}
                            type="button"
                            variant={size === option ? "default" : "outline"}
                            aria-pressed={available && size === option}
                            aria-label={available ? option : `${option} indisponível`}
                            title={available ? option : `${option} indisponível`}
                            disabled={!available}
                            className="catalog-size-option h-10 w-10 p-0"
                            onClick={() => setSize((current) => (current === option ? "" : option))}
                          >
                            {option}
                          </Button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold">Quantidade</p>
                  <div className="inline-flex items-center border">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    >
                      <Minus />
                    </Button>
                    <span className="w-9 text-center text-sm">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Aumentar quantidade"
                      onClick={() => setQuantity((current) => current + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>
                <Button
                  disabled={!canAdd}
                  className="sticky bottom-0 z-10 mt-6 h-12 w-full"
                  onClick={() => {
                    if (!canAdd) return;
                    setCart((prev) =>
                      addOrderLine(prev, {
                        id: selected.id,
                        name: selected.name,
                        ...(color ? { color } : {}),
                        ...(size ? { size } : {}),
                        quantity,
                        ...(selected.price !== undefined ? { price: selected.price } : {}),
                      }),
                    );
                    setSelected(null);
                    setNotice(
                      `${quantity} ${quantity === 1 ? "peça adicionada" : "peças adicionadas"} à sacola.`,
                    );
                  }}
                >
                  <ShoppingBag />
                  Adicionar à sacola
                </Button>
                {isSoldOut(selected) && (
                  <p className="mt-3 text-xs font-medium text-destructive">
                    Esta peça está esgotada.
                  </p>
                )}
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  Valores e disponibilidade serão confirmados pelo WhatsApp.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-center text-xs text-background shadow-lg"
        >
          {notice}
        </div>
      )}
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent
          overlayClassName="backdrop-blur-[4px]"
          className="catalog-bag-sheet flex max-w-none flex-col overflow-x-hidden p-3 sm:p-7"
        >
          <SheetTitle className="pr-5 font-display text-2xl font-normal sm:text-3xl">
            Sua sacola <span className="text-primary">({count})</span>
          </SheetTitle>
          <SheetDescription>Seus próximos looks, em um só lugar.</SheetDescription>
          <div className="catalog-bag-list min-h-0 overflow-y-auto py-5">
            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="mx-auto mb-4 text-primary" size={40} />
                <p className="font-display text-2xl">Sua sacola está vazia.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore as peças e escolha seus próximos looks.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setBagOpen(false)}>
                  Explorar catálogo
                </Button>
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={`${line.id}-${line.size ?? ""}-${line.color ?? ""}`}
                  className="min-w-0 border-b py-4 first:pt-0"
                >
                  <div className="flex gap-3">
                    {catalog.products.find((p) => p.id === line.id)?.images[0] ? (
                      <img
                        src={catalog.products.find((p) => p.id === line.id)?.images[0]}
                        alt={line.name}
                        width={80}
                        height={100}
                        className="cart-item-image h-28 w-20 shrink-0 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-28 w-20 shrink-0 items-center justify-center bg-muted text-center text-[10px]">
                        Sem foto
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="cart-item-header flex min-w-0 items-start justify-between gap-2">
                        <h3 className="cart-item-name min-w-0 text-sm">{line.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cart-remove-button shrink-0"
                          aria-label={`Remover ${line.name}`}
                          onClick={() =>
                            setCart((prev) => prev.filter((l) => !sameOrderLine(l, line)))
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      {line.color && (
                        <p className="mt-1 text-xs text-muted-foreground">Cor: {line.color}</p>
                      )}
                      {line.size && (
                        <p className="mt-1 text-xs text-muted-foreground">Tamanho: {line.size}</p>
                      )}
                      {(() => {
                        const product = catalog.products.find((item) => item.id === line.id);
                        if (!product)
                          return catalog.source === "remote" ? (
                            <p className="mt-2 text-xs text-destructive">
                              Produto indisponível. Remova para continuar.
                            </p>
                          ) : null;
                        return (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {productAvailableSizes(product).length > 1 && (
                              <select
                                aria-label={`Alterar tamanho de ${line.name}`}
                                value={line.size ?? ""}
                                className="max-w-24 border bg-background p-1 text-xs"
                                onChange={(event) =>
                                  setCart((current) =>
                                    replaceOrderLine(current, line, {
                                      ...line,
                                      size: event.target.value,
                                    }),
                                  )
                                }
                              >
                                {line.size &&
                                  !productAvailableSizes(product).includes(line.size) && (
                                    <option value={line.size}>{line.size} (indisponível)</option>
                                  )}
                                {productAvailableSizes(product).map((option) => (
                                  <option
                                    key={option}
                                    value={option}
                                    disabled={Boolean(
                                      line.color && !colorSupportsSize(product, line.color, option),
                                    )}
                                  >
                                    {option}
                                    {line.color && !colorSupportsSize(product, line.color, option)
                                      ? " (indisponível)"
                                      : ""}
                                  </option>
                                ))}
                              </select>
                            )}
                            {(product.colors?.length ?? 0) > 1 && (
                              <select
                                aria-label={`Alterar cor de ${line.name}`}
                                value={line.color ?? ""}
                                className="max-w-28 border bg-background p-1 text-xs"
                                onChange={(event) =>
                                  setCart((current) =>
                                    replaceOrderLine(current, line, {
                                      ...line,
                                      color: event.target.value,
                                    }),
                                  )
                                }
                              >
                                {line.color &&
                                  !product.colors?.some((option) => option.name === line.color) && (
                                    <option value={line.color}>{line.color} (indisponível)</option>
                                  )}
                                {product.colors?.map((option) => (
                                  <option
                                    key={option.name}
                                    value={option.name}
                                    disabled={Boolean(
                                      line.size &&
                                      !colorSupportsSize(product, option.name, line.size),
                                    )}
                                  >
                                    {option.name}
                                    {line.size &&
                                    !colorSupportsSize(product, option.name, line.size)
                                      ? " (indisponível)"
                                      : ""}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })()}
                      {lineIsUnavailable(line) && (
                        <p className="mt-2 text-xs text-destructive">
                          Variação indisponível. Escolha outra opção ou remova a peça.
                        </p>
                      )}
                      <p className="mt-2 text-xs font-semibold">
                        {formatCatalogPrice(line.price) ?? "Valor sob consulta"}
                      </p>
                      <div className="cart-item-actions mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 border">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Diminuir ${line.name}`}
                            onClick={() => changeQuantity(line, -1)}
                          >
                            <Minus />
                          </Button>
                          <span className="w-4 text-center text-xs">{line.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Aumentar ${line.name}`}
                            onClick={() => changeQuantity(line, 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">
                {hasUnknownPrice ? "Subtotal parcial dos itens com preço" : "Subtotal estimado"}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {orderSubtotal(cart) > 0 || !hasUnknownPrice
                  ? formatCatalogPrice(orderSubtotal(cart))
                  : "Valor sob consulta"}
              </p>
              {hasUnknownPrice && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Há peças com valor sob consulta.
                </p>
              )}
              <p className="my-4 rounded-md bg-secondary p-3 text-xs leading-5 text-muted-foreground">
                Valores e disponibilidade serão confirmados pelo WhatsApp.
              </p>
              <Button
                className="min-h-12 w-full whitespace-normal px-2 py-2 text-center text-xs leading-tight sm:h-12 sm:text-sm"
                disabled={cart.some(lineIsUnavailable)}
                onClick={sendOrder}
              >
                <MessageCircle /> Concluir pedido no WhatsApp
              </Button>
              {copyFallback && (
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(whatsappOrderText(cart))
                      .then(() => setNotice("Mensagem copiada."))
                      .catch(() => setNotice("Não foi possível copiar a mensagem."))
                  }
                >
                  Copiar mensagem
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
