import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
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
  formatCatalogPrice,
  isAccessoryCategory,
  whatsappOrderUrl,
  STORE_INSTAGRAM,
  STORE_WHATSAPP,
  type OrderLine,
} from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog-types";
import { getAdminSession } from "@/lib/admin-auth";
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
      <img
        src={isPreviewing ? previewImage : product.images[0]}
        alt={product.name}
        width={768}
        height={1024}
        loading={loading}
        className="product-photo"
      />
    </Button>
  );
}

export function Catalog() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState("Todas as peças");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [cart, setCart] = useState<OrderLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("Todos");

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

  const catalog = useCatalog(products, categories);
  const visible = catalog.products
    .filter(
      (p) =>
        (category === "Todas as peças" || p.category === category) &&
        p.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "new"
          ? Number(Boolean(b.tag === "NOVO")) - Number(Boolean(a.tag === "NOVO"))
          : 0,
    );
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  function select(p: Product) {
    setSelected(p);
    setSelectedImageIndex(0);
    setSize(isAccessoryCategory(p.category) ? "" : sizeFilter === "Todos" ? "" : sizeFilter);
  }
  function changeQuantity(line: OrderLine, delta: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.id === line.id && l.size === line.size ? { ...l, quantity: l.quantity + delta } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }
  const selectedIsAccessory = selected ? isAccessoryCategory(selected.category) : false;
  const cartHasSizedItem = cart.some((line) => Boolean(line.size));
  return (
    <>
      <SiteNavbar
        isAdmin={isAdmin}
        leftAction={
          <Button
            variant="navbar"
            size="navbarIcon"
            title="Buscar peças"
            aria-label="Buscar peças"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search />
          </Button>
        }
        rightAction={
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
        }
      />
      <main
        data-testid="catalog"
        data-catalog-source={catalog.source}
        className="mx-auto max-w-[1440px] px-6 pb-20 pt-12 lg:px-14 lg:pt-14"
      >
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-primary">
              DIVA ATIVA · MODA FITNESS
            </p>
            <h1 className="catalog-heading">
              Vista sua <em className="text-primary">melhor versão.</em>
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Do treino ao seu dia a dia, encontre o look que acompanha você.
            </p>
          </div>
          <div className="mb-1 hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Feito para mulheres em movimento
          </div>
        </div>
        {searchOpen && (
          <div className="mb-5 flex items-center gap-3 border-b py-3">
            <Search size={18} />
            <input
              autoFocus
              aria-label="Nome da peça"
              placeholder="O que você está procurando?"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Fechar busca"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
            >
              <X />
            </Button>
          </div>
        )}
        <div className="w-full border-b">
          <div className="flex w-full min-w-0 gap-6 overflow-x-auto sm:gap-8">
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
            {visible.length} peças {sizeFilter !== "Todos" && `· tamanho ${sizeFilter}`}
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
            Cores disponíveis e Valor sob consulta
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
          {visible.map((p, i) => {
            const formattedPrice = formatCatalogPrice(p.price);

            return (
              <article key={p.id} className="min-w-0">
                <div className="product-image relative overflow-hidden rounded-sm bg-muted">
                  <ProductImageButton
                    product={p}
                    loading={i === 0 ? "eager" : "lazy"}
                    onSelect={() => select(p)}
                  />
                  {p.tag && (
                    <span className="absolute left-3 top-3 bg-background/95 px-2.5 py-1.5 text-[8px] font-medium sm:text-[9px]">
                      {p.tag}
                    </span>
                  )}
                  <Button
                    variant="photoIcon"
                    size="icon"
                    className="absolute bottom-3 right-3"
                    title="Adicionar à sacola"
                    aria-label={`Adicionar ${p.name} à sacola`}
                    onClick={() => select(p)}
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="pt-4">
                  <p className="mb-1.5 text-[10px] text-muted-foreground">{p.category}</p>
                  <Button variant="productName" className="w-full px-0" onClick={() => select(p)}>
                    {p.name}
                  </Button>
                  {formattedPrice && (
                    <p className="mt-1.5 text-sm font-medium text-foreground">{formattedPrice}</p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {formattedPrice
                      ? "Consultar cores disponíveis."
                      : "Consultar valores e cores disponíveis."}
                  </p>
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
        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-y py-7 sm:flex-row">
          <div className="flex items-center gap-4">
            <MessageCircle className="text-primary" size={24} />
            <div>
              <h2 className="font-display text-25px text-2xl">Um toque de cuidado, de perto.</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Fale com a Diva Ativa e encontre seu próximo look.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
        <DialogContent className="h-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto p-5 sm:h-[720px] sm:max-h-[calc(100dvh-2rem)] sm:p-6">
          {selected && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <img
                  src={selected.images[selectedImageIndex] ?? selected.images[0]}
                  alt={selected.name}
                  width={768}
                  height={1024}
                  className="hidden h-auto w-full rounded-sm sm:block sm:h-[500px] sm:object-contain"
                />
                <div className="grid grid-cols-3 gap-2">
                  {selected.images.map((image, imageIndex) => (
                    <button
                      key={image}
                      type="button"
                      aria-label={`Ver imagem ${imageIndex + 1} de ${selected.name}`}
                      aria-pressed={selectedImageIndex === imageIndex}
                      onClick={() => setSelectedImageIndex(imageIndex)}
                      className={`overflow-hidden rounded-sm border transition-colors ${
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
              </div>
              <div className="product-dialog-details flex flex-col justify-start">
                <p className="mb-3 text-xs text-primary">{selected.category}</p>
                <DialogTitle className="font-display text-3xl font-normal">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="mt-4 leading-6">
                  {selected.description}
                </DialogDescription>
                <p className="mt-5 text-sm">
                  {selectedIsAccessory ? "Cores confirmadas pelo WhatsApp" : selected.color} · Valor
                  sob consulta
                </p>
                {!selectedIsAccessory && (
                  <>
                    <p className="mb-3 mt-7 text-xs">Tamanho</p>
                    <div className="flex gap-2">
                      {["P", "M", "G", "GG"].map((s) => (
                        <Button
                          key={s}
                          variant={size === s ? "default" : "outline"}
                          aria-pressed={size === s}
                          onClick={() => setSize(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
                <Button
                  disabled={!selectedIsAccessory && !size}
                  className="mt-6 h-12"
                  onClick={() => {
                    setCart((prev) =>
                      addOrderLine(prev, {
                        id: selected.id,
                        name: selected.name,
                        color: selectedIsAccessory ? undefined : selected.color,
                        size: selectedIsAccessory ? undefined : size,
                      }),
                    );
                    setSelected(null);
                    setBagOpen(true);
                  }}
                >
                  <ShoppingBag />
                  Adicionar à sacola
                </Button>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  Valores e disponibilidade confirmados pelo WhatsApp.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="flex w-2/3 max-w-none flex-col overflow-x-hidden p-4 sm:p-6">
          <SheetTitle className="font-display text-3xl font-normal">
            Sua sacola <span className="text-primary">({count})</span>
          </SheetTitle>
          <SheetDescription>Seus próximos looks, em um só lugar.</SheetDescription>
          <div className="flex-1 overflow-y-auto py-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto mb-4 text-primary" size={40} />
                <p className="font-display text-2xl">Sua sacola está esperando você!</p>
                <Button variant="outline" className="mt-6" onClick={() => setBagOpen(false)}>
                  Explorar catálogo
                </Button>
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={`${line.id}-${line.size ?? ""}`}
                  className="flex min-w-0 gap-4 border-b py-5"
                >
                  <div className="flex gap-4">
                    <img
                      src={catalog.products.find((p) => p.id === line.id)?.images[0]}
                      alt={line.name}
                      width={96}
                      height={128}
                      className="cart-item-image h-32 w-24 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="cart-item-header flex min-w-0 items-start justify-between gap-2">
                        <h3 className="cart-item-name min-w-0 text-sm">{line.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cart-remove-button shrink-0"
                          aria-label={`Remover ${line.name}`}
                          onClick={() =>
                            setCart((prev) =>
                              prev.filter((l) => !(l.id === line.id && l.size === line.size)),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      {line.size && (
                        <p className="mt-1 text-xs text-muted-foreground">Tamanho · {line.size}</p>
                      )}
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
            <div className="border-t pt-5">
              <p className="mb-4 text-xs leading-5 text-muted-foreground">
                {cartHasSizedItem
                  ? "A Diva Ativa confirma os valores, tamanhos e a entrega com você pelo WhatsApp."
                  : "A Diva Ativa confirma os valores, as cores disponíveis e a entrega com você pelo WhatsApp."}
              </p>
              <Button
                asChild
                className="h-12 min-w-0 w-full whitespace-normal px-2 text-xs leading-tight sm:text-sm"
              >
                <a href={whatsappOrderUrl(cart)} target="_blank" rel="noreferrer">
                  <span className="cart-checkout-label min-w-0 text-center">
                    Concluir pedido no WhatsApp
                  </span>
                </a>
              </Button>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <Check size={12} />
                Atendimento direto com a loja
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Encontre seu próximo look.</SheetDescription>
          <p className="mb-3 mt-8 text-sm">Tamanho desejado</p>
          <div className="flex flex-wrap gap-2">
            {["Todos", "P", "M", "G", "GG"].map((s) => (
              <Button
                key={s}
                variant={sizeFilter === s ? "default" : "outline"}
                onClick={() => setSizeFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Disponibilidade de tamanhos sob consulta.
          </p>
          <Button className="mt-8 w-full" onClick={() => setFilterOpen(false)}>
            Aplicar
          </Button>
          <Button variant="link" className="mt-3 w-full" onClick={() => setSizeFilter("Todos")}>
            Limpar filtros
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
