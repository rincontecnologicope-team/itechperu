"use client";

import { motion } from "framer-motion";
import { Landmark, PackageCheck, Smartphone, Truck } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeSectionsContent } from "@/types/home-sections";

interface PaymentMethodsSectionProps {
  content: HomeSectionsContent;
}

export function PaymentMethodsSection({ content }: PaymentMethodsSectionProps) {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pagos"
          title={content.paymentsTitle}
          description={content.paymentsSubtitle}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.35 }}
            className="premium-highlight rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_26px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-slate-900" />
              <p className="text-sm font-semibold text-slate-950">{content.bankTitle}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {content.banks.map((bank) => (
                <span
                  key={bank}
                  className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {bank}
                </span>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="premium-highlight rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_26px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="size-5 text-slate-900" />
              <p className="text-sm font-semibold text-slate-950">{content.mobileTitle}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {content.mobileMethods.map((mobilePay) => (
                <span
                  key={mobilePay}
                  className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {mobilePay}
                </span>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="premium-highlight rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_26px_rgba(15,23,42,0.08)] md:col-span-2 lg:col-span-1"
          >
            <div className="grid gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Truck className="size-4 text-slate-900" />
                <p className="text-xs font-semibold text-slate-700">{content.cashOnDeliveryText}</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <PackageCheck className="size-4 text-slate-900" />
                <p className="text-xs font-semibold text-slate-700">{content.provinceShippingText}</p>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
