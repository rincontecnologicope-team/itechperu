"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeSectionsContent } from "@/types/home-sections";

interface TestimonialsSectionProps {
  content: HomeSectionsContent;
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) {
      return;
    }
    const amount = direction === "left" ? -360 : 360;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonios"
          title={content.testimonialsTitle}
          description={content.testimonialsSubtitle}
        />

        <div className="relative mt-8">
          <div className="absolute right-0 top-[-4.25rem] hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Desplazar testimonios a la izquierda"
              onClick={() => scroll("left")}
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Desplazar testimonios a la derecha"
              onClick={() => scroll("right")}
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4 }}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          >
            {content.testimonials.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="premium-highlight min-w-[84%] snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.08)] sm:min-w-[58%] md:min-w-[42%] lg:min-w-[31%]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full border border-slate-200">
                    <Image
                      src={
                        item.avatar ||
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80"
                      }
                      alt={`Avatar de ${item.name}`}
                      fill
                      loading="lazy"
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                    <p className="text-xs tracking-wide text-amber-500">
                      {"★".repeat(Math.min(5, Math.max(1, Math.round(item.rating || 5))))}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
