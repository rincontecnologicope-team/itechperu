"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import {
  extractColorsFromSummary,
  extractModelFromSummary,
  extractStorageFromSummary,
  removeColorsLine,
  removeModelLine,
  removeStorageLine,
  splitProductDescriptionLines,
} from "@/lib/product-description";
import { normalizeProductColors } from "@/lib/product-colors";
import { getPrimaryImageUrl } from "@/lib/product-images";
import { formatPen } from "@/lib/format";
import { calculateSimulatedStock } from "@/lib/stock";
import { createWhatsAppProductLink } from "@/lib/whatsapp";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { siteConfig } from "@/config/site";
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
  const primaryImage = getPrimaryImageUrl(product);
  const modelValue = (product.model?.trim() || extractModelFromSummary(product.summary) || "").trim();
  const storageValue =
    (product.storage?.trim() || extractStorageFromSummary(product.summary) || "").trim();
  const colorsValue =
    product.colors.length > 0
      ? normalizeProductColors(product.colors)
      : normalizeProductColors(extractColorsFromSummary(product.summary));
  const descriptionPreviewLines = useMemo(() => {
    const rawLines = splitProductDescriptionLines(product.summary);
    const withoutModel = modelValue ? removeModelLine(rawLines) : rawLines;
    const withoutStorage = storageValue ? removeStorageLine(withoutModel) : withoutModel;
    const cleanLines = colorsValue.length > 0 ? removeColorsLine(withoutStorage) : withoutStorage;
    return cleanLines.slice(0, 4);
  }, [colorsValue.length, modelValue, product.summary, storageValue]);
  const productUrl = `${siteConfig.url}/producto/${product.slug}`;
  const preferredColor = colorsValue[0]?.name || colorsValue[0]?.hex;
  const whatsappLink = createWhatsAppProductLink(product.name, product.price, {
    model: modelValue,
    storage: storageValue,
    color: preferredColor,
    productUrl,
  });

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
        className="relative block aspect-square overflow-hidden bg-slate-100"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, (max-width: 1440px) 24vw, 320px"
          quality={84}
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
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

        {modelValue ? (
          <p className="mt-2 text-xs font-medium text-slate-700">
            <span className="text-slate-500">Modelo:</span> {modelValue}
          </p>
        ) : null}

        {storageValue ? (
          <p className="mt-1 text-xs font-medium text-slate-700">
            <span className="text-slate-500">Almacenamiento:</span> {storageValue}
          </p>
        ) : null}

        {colorsValue.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Colores:</span>
            {colorsValue.slice(0, 5).map((color, index) => (
              <span
                key={`${color.hex}-${index}`}
                className="inline-flex size-4 rounded-full border border-slate-300"
                title={color.name || color.hex}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        ) : null}

        <ul className="mt-2 grid gap-1 text-xs leading-relaxed text-slate-600">
          {descriptionPreviewLines.map((line) => (
            <li key={`${product.id}-${line}`} className="max-h-[2.8rem] overflow-hidden whitespace-pre-line">
              {line}
            </li>
          ))}
        </ul>

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
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">Garantia real</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">Contraentrega Lima</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">Boleta</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Link
            href={`/producto/${product.slug}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Ver detalle
          </Link>
          <WhatsAppLink
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            tracking={{
              source: "product_card_whatsapp",
              productId: product.id,
              productName: product.name,
              price: product.price,
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-whatsapp)] px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,211,102,0.34)] transition hover:bg-[var(--color-whatsapp-dark)]"
          >
            Consultar por WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </motion.article>
  );
}
