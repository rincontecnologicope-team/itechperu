"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { formatPen } from "@/lib/format";
import { calculateSimulatedStock } from "@/lib/stock";
import { createWhatsAppProductLink } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index: number;
}

const badgeStyles: Record<Product["badgeType"], string> = {
  offer: "bg-rose-50 text-rose-700 border-rose-100",
  score: "bg-amber-50 text-amber-700 border-amber-100",
  new: "bg-sky-50 text-sky-700 border-sky-100",
};

export function ProductCard({ product, index }: ProductCardProps) {
  const stock = useMemo(
    () => calculateSimulatedStock(product.id, product.baseStock),
    [product.baseStock, product.id],
  );
  const whatsappLink = createWhatsAppProductLink(product.name, product.price);

  return (
    <motion.article
      className="premium-highlight group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      whileTap={{ y: -2 }}
    >
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[product.badgeType]}`}
          >
            {product.badgeText}
          </span>
          <span className="text-xs font-medium text-slate-500">{product.category}</span>
        </div>

        <Link href={`/producto/${product.slug}`} className="min-h-[3rem]">
          <h3 className="text-sm font-semibold leading-snug text-slate-950 sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-xs text-slate-600">{product.summary}</p>

        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-slate-950">
            {formatPen(product.price)}
          </p>
          {product.previousPrice ? (
            <p className="mt-1 text-sm text-slate-400 line-through">
              Antes {formatPen(product.previousPrice)}
            </p>
          ) : null}
          <p
            className={`mt-2 text-xs font-semibold ${
              stock <= 2 ? "text-rose-600" : "text-amber-600"
            }`}
          >
            Stock limitado: {stock} unidades
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          <Link
            href={`/producto/${product.slug}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Ver detalle
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-whatsapp)] px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,211,102,0.34)] transition hover:bg-[var(--color-whatsapp-dark)]"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}
