"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { calculateSimulatedStock } from "@/lib/stock";
import type { LandingContent } from "@/types/landing-content";
import type { Product } from "@/types/product";

interface UrgencySectionProps {
  products: Product[];
  content: LandingContent;
}

export function UrgencySection({ products, content }: UrgencySectionProps) {
  const newArrivals = useMemo(
    () => products.filter((product) => product.isNewArrival).slice(0, 4),
    [products],
  );
  const bestSellers = useMemo(
    () => products.filter((product) => product.isBestSeller).slice(0, 4),
    [products],
  );

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={content.urgencyEyebrow}
          title={content.urgencyTitle}
          description={content.urgencyDescription}
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="premium-highlight rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recien llegados
            </h3>
            <div className="mt-5 space-y-3">
              {newArrivals.map((product) => {
                const stock = calculateSimulatedStock(product.id, product.baseStock);
                return (
                  <div
                    key={product.id}
                    className="premium-highlight flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">Estado {product.conditionLabel}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        stock <= 2
                          ? "bg-rose-50 text-rose-700 animate-pulse"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {stock} en stock
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: 0.06 }}
            whileHover={{ y: -3 }}
            className="premium-highlight rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Mas vendidos
            </h3>
            <div className="mt-5 space-y-3">
              {bestSellers.map((product) => {
                const stock = calculateSimulatedStock(product.id, product.baseStock);
                return (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className="premium-highlight flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">Alta conversion en Marketplace</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        stock <= 2
                          ? "bg-rose-50 text-rose-700 animate-pulse"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      Quedan {stock}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
