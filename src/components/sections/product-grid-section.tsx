"use client";

import { motion } from "framer-motion";

import { ProductCard } from "@/components/ui/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { LandingContent } from "@/types/landing-content";
import type { Product } from "@/types/product";

interface ProductGridSectionProps {
  products: Product[];
  content: LandingContent;
}

export function ProductGridSection({ products, content }: ProductGridSectionProps) {
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <section id="catalogo" className="scroll-mt-24 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={content.catalogEyebrow}
          title={content.catalogTitle}
          description={content.catalogDescription}
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {category}
            </span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
