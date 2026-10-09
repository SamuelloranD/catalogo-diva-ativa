import type { ReactNode } from "react";
import { Instagram, Lock, MessageCircle } from "lucide-react";

import brandLogo from "@/assets/diva-ativa-logo.png";
import { Button } from "@/components/ui/button";
import { STORE_INSTAGRAM, STORE_WHATSAPP } from "@/lib/catalog";

type SiteNavbarProps = {
  actions?: ReactNode;
  isAdmin?: boolean;
};

export function SiteNavbar({ actions, isAdmin = false }: SiteNavbarProps) {
  return (
    <>
      <div className="flex min-h-9 items-center justify-center gap-2 bg-announcement px-4 py-2 text-center text-xs text-foreground">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-6 gap-1 border-foreground/30 bg-transparent px-2 text-[9px] leading-none text-foreground hover:bg-foreground hover:text-background [&_svg]:size-3"
        >
          <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noreferrer">
            <MessageCircle /> Pedidos pelo WhatsApp
          </a>
        </Button>
        <span className="mx-2 opacity-50">|</span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-6 gap-1 border-foreground/30 bg-transparent px-2 text-[9px] leading-none text-foreground hover:bg-foreground hover:text-background [&_svg]:size-3"
        >
          <a href={STORE_INSTAGRAM} target="_blank" rel="noreferrer">
            <Instagram /> Siga nosso instagram
          </a>
        </Button>
      </div>
      <header className="border-b border-foreground/10 bg-sage text-primary-foreground">
        <div className="relative mx-auto flex h-24 max-w-[1440px] items-center justify-between px-6 lg:px-14">
          <a href="/" className="brand" aria-label="Diva Ativa, início">
            <img src={brandLogo} alt="Diva Ativa, início" className="brand-logo" />
          </a>
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 text-sm md:flex">
            <span>Seu movimento. Seu estilo.</span>
          </nav>
          <div className="flex items-center gap-2 text-foreground sm:gap-4">
            {isAdmin && (
              <Button asChild variant="navbar" size="icon" title="Abrir painel admin">
                <a href="/admin" aria-label="Abrir painel admin">
                  <Lock />
                </a>
              </Button>
            )}
            {actions}
          </div>
        </div>
      </header>
    </>
  );
}
