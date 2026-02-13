"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeSectionsContent } from "@/types/home-sections";

interface FaqSectionProps {
  content: HomeSectionsContent;
}

export function FaqSection({ content }: FaqSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          eyebrow="FAQ"
          title={content.faqTitle}
          description={content.faqSubtitle}
        />

        <div className="mt-8 grid gap-3">
          {content.faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <article
                key={faq.id}
                className="premium-highlight overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_22px_rgba(15,23,42,0.06)]"
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left sm:px-5"
                >
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">
                    {faq.question}
                  </span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-slate-300 text-slate-700">
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 sm:px-5 sm:pb-5">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
