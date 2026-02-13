"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Box, ShieldCheck, Truck } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import type { LandingContent } from "@/types/landing-content";

const trustItems = [
  {
    title: "Productos verificados",
    description: "Revisamos funcionalidad y estado real antes de publicar.",
    icon: BadgeCheck,
  },
  {
    title: "Contraentrega en Lima",
    description: "Coordinamos entrega segura para cerrar compra sin friccion.",
    icon: Truck,
  },
  {
    title: "Importados de USA",
    description: "Inventario seleccionado directamente en lotes confiables.",
    icon: Box,
  },
  {
    title: "Garantia funcional",
    description: "Cada equipo se entrega operativo y con soporte post venta.",
    icon: ShieldCheck,
  },
];

interface TrustSectionProps {
  content: LandingContent;
}

export function TrustSection({ content }: TrustSectionProps) {
  return (
    <section id="confianza" className="scroll-mt-24 bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={content.trustEyebrow}
          title={content.trustTitle}
          description={content.trustDescription}
        />

        <div className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              whileTap={{ y: -1 }}
              className="premium-highlight rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
            >
              <item.icon className="size-5 text-slate-900" />
              <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
