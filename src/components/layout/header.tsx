import Link from "next/link";
import Image from "next/image";

import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { createWhatsAppGenericLink } from "@/lib/whatsapp";

const headerMessage = "Hola quiero conocer sus productos disponibles de iTech Peru";
const menuItemClasses =
  "premium-highlight inline-flex min-h-10 items-center rounded-xl border border-transparent px-4 text-sm font-semibold text-slate-700 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,164,90,0.35)]";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.14)]">
            <Image
              src="/brand/itech-mark.svg"
              alt="Logo iTech Peru"
              width={36}
              height={36}
              className="size-9 object-contain"
              priority
            />
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-slate-950 sm:text-base">
              iTech Peru
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Importados USA
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#catalogo" className={menuItemClasses}>
            Productos
          </Link>
          <Link href="#confianza" className={menuItemClasses}>
            Confianza
          </Link>
          <WhatsAppLink
            href={createWhatsAppGenericLink(headerMessage)}
            target="_blank"
            rel="noopener noreferrer"
            tracking={{ source: "header_nav_whatsapp" }}
            className="premium-highlight inline-flex min-h-10 items-center rounded-xl border border-transparent bg-[var(--color-whatsapp)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-whatsapp-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(200,164,90,0.35)]"
          >
            WhatsApp
          </WhatsAppLink>
        </nav>
      </div>
    </header>
  );
}
