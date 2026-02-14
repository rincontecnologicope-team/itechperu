"use client";

import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { formatPen } from "@/lib/format";

interface ProductStickyWhatsAppBarProps {
  href: string;
  price: number;
  productId: string;
  productName: string;
}

export function ProductStickyWhatsAppBar({
  href,
  price,
  productId,
  productName,
}: ProductStickyWhatsAppBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] pt-2 shadow-[0_-10px_26px_rgba(15,23,42,0.15)] backdrop-blur md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cierre por WhatsApp
          </p>
          <p className="text-xl font-bold leading-tight text-slate-950">{formatPen(price)}</p>
        </div>
        <WhatsAppLink
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tracking={{
            source: "product_detail_sticky_whatsapp",
            productId,
            productName,
            price,
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-whatsapp)] px-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(37,211,102,0.34)]"
        >
          Consultar ahora
        </WhatsAppLink>
      </div>
    </div>
  );
}
