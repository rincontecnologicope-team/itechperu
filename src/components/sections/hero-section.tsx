"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { createWhatsAppGenericLink } from "@/lib/whatsapp";
import type { LandingContent } from "@/types/landing-content";

interface HeroSectionProps {
  productCount: number;
  content: LandingContent;
}

const heroMessage =
  "Hola, vengo de Facebook Marketplace y quiero informacion de sus productos disponibles";

export function HeroSection({ productCount, content }: HeroSectionProps) {
  const heroDescription = content.heroDescription.replace(/\{count\}/g, String(productCount));

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,#d9e7ff_0%,#f8fafc_45%,#ffffff_80%)] pb-14 pt-10 sm:pb-16 sm:pt-14">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
          >
            {content.heroEyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-4 font-heading text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl"
          >
            {content.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base"
          >
            {heroDescription}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-7 grid gap-3 sm:flex"
          >
            <a
              href="#catalogo"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              {content.heroPrimaryCtaLabel}
            </a>
            <a
              href={createWhatsAppGenericLink(heroMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
            >
              {content.heroSecondaryCtaLabel}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
            {content.heroImageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
                <Image
                  src={content.heroImageUrl}
                  alt={content.heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <div className="rounded-[1.4rem] bg-slate-950 p-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    {content.heroCardEyebrow}
                  </p>
                  <p className="mt-2 font-heading text-xl font-semibold">
                    {content.heroCardTitle}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200" />
                  <div className="h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200" />
                  <div className="h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200" />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
