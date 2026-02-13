"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { normalizeProductColors } from "@/lib/product-colors";
import { extractColorsFromSummary, extractStorageFromSummary } from "@/lib/product-description";
import type { LandingContent } from "@/types/landing-content";
import type { Product } from "@/types/product";

interface ProductGridSectionProps {
  products: Product[];
  content: LandingContent;
}

interface StorageOption {
  key: string;
  label: string;
  count: number;
}

interface ColorOption {
  key: string;
  label: string;
  hex: string;
  count: number;
}

function normalizeStorageKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getProductStorage(product: Product): string {
  return (product.storage?.trim() || extractStorageFromSummary(product.summary) || "").trim();
}

function getProductColors(product: Product) {
  const direct = normalizeProductColors(product.colors);
  if (direct.length > 0) {
    return direct;
  }
  return normalizeProductColors(extractColorsFromSummary(product.summary));
}

function filterChipClass(active: boolean): string {
  return active
    ? "border-slate-900 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
}

export function ProductGridSection({ products, content }: ProductGridSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStorage, setSelectedStorage] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const storageOptions = useMemo<StorageOption[]>(() => {
    const counts = new Map<string, StorageOption>();

    for (const product of products) {
      const storage = getProductStorage(product);
      if (!storage) {
        continue;
      }

      const key = normalizeStorageKey(storage);
      const current = counts.get(key);
      if (current) {
        current.count += 1;
      } else {
        counts.set(key, {
          key,
          label: storage,
          count: 1,
        });
      }
    }

    return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [products]);

  const colorOptions = useMemo<ColorOption[]>(() => {
    const counts = new Map<string, ColorOption>();

    for (const product of products) {
      const colors = getProductColors(product);
      for (const color of colors) {
        const key = color.hex;
        const current = counts.get(key);
        if (current) {
          current.count += 1;
          if (!current.label && color.name) {
            current.label = color.name;
          }
        } else {
          counts.set(key, {
            key,
            hex: color.hex,
            label: color.name || color.hex,
            count: 1,
          });
        }
      }
    }

    return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      if (selectedStorage !== "all") {
        const storage = getProductStorage(product);
        if (!storage || normalizeStorageKey(storage) !== selectedStorage) {
          return false;
        }
      }

      if (selectedColor !== "all") {
        const colors = getProductColors(product);
        if (!colors.some((color) => color.hex === selectedColor)) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, selectedStorage, selectedColor]);

  const hasActiveFilters =
    selectedCategory !== "all" || selectedStorage !== "all" || selectedColor !== "all";

  return (
    <section id="catalogo" className="scroll-mt-24 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={content.catalogEyebrow}
          title={content.catalogTitle}
          description={content.catalogDescription}
        />

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Filtros</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStorage("all");
                  setSelectedColor("all");
                }}
                className="inline-flex min-h-8 items-center rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Limpiar
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Categoria</p>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition ${filterChipClass(
                        active,
                      )}`}
                    >
                      {category === "all" ? "Todos" : category}
                    </button>
                  );
                })}
              </div>
            </div>

            {storageOptions.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Almacenamiento
                </p>
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStorage("all")}
                    className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition ${filterChipClass(
                      selectedStorage === "all",
                    )}`}
                  >
                    Todos
                  </button>
                  {storageOptions.map((option) => {
                    const active = selectedStorage === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedStorage(option.key)}
                        className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition ${filterChipClass(
                          active,
                        )}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {colorOptions.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Colores</p>
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedColor("all")}
                    className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition ${filterChipClass(
                      selectedColor === "all",
                    )}`}
                  >
                    Todos
                  </button>
                  {colorOptions.map((option) => {
                    const active = selectedColor === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedColor(option.key)}
                        className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${filterChipClass(
                          active,
                        )}`}
                      >
                        <span
                          className="inline-flex size-3 rounded-full border border-slate-300"
                          style={{ backgroundColor: option.hex }}
                          aria-hidden
                        />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-slate-600">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-semibold text-slate-900">No hay resultados con esos filtros</p>
            <p className="mt-2 text-sm text-slate-600">Prueba cambiando color o almacenamiento.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.4 }}
            className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
