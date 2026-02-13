import Link from "next/link";

import { createWhatsAppGenericLink } from "@/lib/whatsapp";

const headerMessage = "Hola quiero conocer sus productos disponibles de iTech Peru";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            iT
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
          <Link
            href="#catalogo"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Productos
          </Link>
          <Link
            href="#confianza"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Confianza
          </Link>
          <a
            href={createWhatsAppGenericLink(headerMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center rounded-xl bg-[var(--color-whatsapp)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-whatsapp-dark)]"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
