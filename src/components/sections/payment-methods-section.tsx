"use client";

import { motion } from "framer-motion";
import { Building2, Landmark, PackageCheck, Smartphone, Truck, Wallet } from "lucide-react";
import Image from "next/image";

import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeSectionsContent } from "@/types/home-sections";

interface PaymentMethodsSectionProps {
  content: HomeSectionsContent;
}

interface BrandVisual {
  short: string;
  accentBarClass: string;
  chipClass: string;
  textClass: string;
  logoSrc?: string;
  logoAlt?: string;
  logoBgClass?: string;
  logoFrameClass?: string;
  logoImageClass?: string;
}

const BANK_BRANDS: Record<string, BrandVisual> = {
  bcp: {
    short: "BCP",
    accentBarClass: "from-blue-600 to-blue-400",
    chipClass: "border-blue-200 bg-blue-50",
    textClass: "text-blue-700",
    logoSrc: "/brands/bcp.svg",
    logoAlt: "Logo BCP",
    logoBgClass: "bg-white",
  },
  interbank: {
    short: "IBK",
    accentBarClass: "from-emerald-500 to-emerald-300",
    chipClass: "border-emerald-200 bg-emerald-50",
    textClass: "text-emerald-700",
    logoSrc: "/brands/interbank.svg",
    logoAlt: "Logo Interbank",
    logoBgClass: "bg-white",
  },
  bbva: {
    short: "BBVA",
    accentBarClass: "from-sky-600 to-cyan-400",
    chipClass: "border-sky-200 bg-sky-50",
    textClass: "text-sky-700",
    logoSrc: "/brands/bbva-white.png",
    logoAlt: "Logo oficial BBVA",
    logoBgClass: "bg-[#061a6b]",
    logoImageClass: "h-auto max-h-[18px] w-auto max-w-[52px] object-contain",
  },
};

const MOBILE_BRANDS: Record<string, BrandVisual> = {
  yape: {
    short: "Y",
    accentBarClass: "from-purple-600 to-fuchsia-400",
    chipClass: "border-purple-200 bg-purple-50",
    textClass: "text-purple-700",
    logoSrc: "/brands/yape-official.png",
    logoAlt: "Logo oficial Yape",
    logoBgClass: "bg-[#6A1189]",
    logoFrameClass: "h-9 w-9 rounded-xl",
    logoImageClass: "h-6 w-6 object-contain",
  },
  plin: {
    short: "P",
    accentBarClass: "from-emerald-600 to-teal-400",
    chipClass: "border-emerald-200 bg-emerald-50",
    textClass: "text-emerald-700",
    logoSrc: "/brands/plin-official.png",
    logoAlt: "Logo oficial Plin",
    logoFrameClass: "h-9 w-9 rounded-xl",
    logoImageClass: "h-7 w-7 object-contain",
  },
};

function normalizeKey(value: string): string {
  return value.toLowerCase().trim();
}

function getVisualForBank(name: string): BrandVisual {
  const key = normalizeKey(name);
  const matched = BANK_BRANDS[key];
  if (matched) {
    return matched;
  }

  return {
    short: name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "BK",
    accentBarClass: "from-slate-600 to-slate-400",
    chipClass: "border-slate-200 bg-slate-50",
    textClass: "text-slate-700",
  };
}

function getVisualForMobile(name: string): BrandVisual {
  const key = normalizeKey(name);
  const matched = MOBILE_BRANDS[key];
  if (matched) {
    return matched;
  }

  return {
    short: name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "MP",
    accentBarClass: "from-slate-600 to-slate-400",
    chipClass: "border-slate-200 bg-slate-50",
    textClass: "text-slate-700",
  };
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

            <div className="mt-4 grid gap-2.5">
              {content.banks.map((bank) => {
                const visual = getVisualForBank(bank);
                return (
                  <div
                    key={bank}
                    className="premium-highlight relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${visual.accentBarClass}`} />
                    <div className="flex items-center gap-2.5">
                      {visual.logoSrc ? (
                        <span
                          className={`inline-flex items-center justify-center overflow-hidden border border-slate-200 shadow-[0_4px_10px_rgba(15,23,42,0.12)] ${visual.logoFrameClass ?? "h-9 w-16 rounded-xl"} ${visual.logoBgClass ?? "bg-white"}`}
                        >
                          <Image
                            src={visual.logoSrc}
                            alt={visual.logoAlt ?? `Logo ${bank}`}
                            width={60}
                            height={24}
                            loading="lazy"
                            className={visual.logoImageClass ?? "h-auto max-h-5 w-auto max-w-[52px] object-contain"}
                          />
                        </span>
                      ) : (
                        <span
                          className={`inline-flex min-w-11 items-center justify-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${visual.chipClass} ${visual.textClass}`}
                        >
                          {visual.short}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{bank}</p>
                        <p className="text-[11px] text-slate-500">Transferencia verificada</p>
                      </div>
                      <span className="ml-auto inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Seguro
                      </span>
                    </div>
                  </div>
                );
              })}
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

            <div className="mt-4 grid gap-2.5">
              {content.mobileMethods.map((mobilePay) => {
                const visual = getVisualForMobile(mobilePay);
                return (
                  <div
                    key={mobilePay}
                    className="premium-highlight relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${visual.accentBarClass}`} />
                    <div className="flex items-center gap-2.5">
                      {visual.logoSrc ? (
                        <span
                          className={`inline-flex items-center justify-center overflow-hidden border border-slate-200 shadow-[0_4px_10px_rgba(15,23,42,0.12)] ${visual.logoFrameClass ?? "h-9 w-16 rounded-xl"} ${visual.logoBgClass ?? "bg-white"}`}
                        >
                          <Image
                            src={visual.logoSrc}
                            alt={visual.logoAlt ?? `Logo ${mobilePay}`}
                            width={44}
                            height={44}
                            loading="lazy"
                            className={visual.logoImageClass ?? "h-auto max-h-5 w-auto max-w-[52px] object-contain"}
                          />
                        </span>
                      ) : (
                        <span
                          className={`inline-flex size-8 items-center justify-center rounded-full border ${visual.chipClass}`}
                        >
                          <Wallet className={`size-4 ${visual.textClass}`} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{mobilePay}</p>
                        <p className="text-[11px] text-slate-500">Confirmacion al instante</p>
                      </div>
                      <span className="ml-auto inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Rapido
                      </span>
                    </div>
                  </div>
                );
              })}
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
              <div className="premium-highlight flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <Truck className="size-4 text-slate-900" />
                </span>
                <p className="text-xs font-semibold text-slate-700">{content.cashOnDeliveryText}</p>
              </div>
              <div className="premium-highlight flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <PackageCheck className="size-4 text-slate-900" />
                </span>
                <p className="text-xs font-semibold text-slate-700">{content.provinceShippingText}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-100">
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  Procesos bancarios y pagos auditados para mayor confianza.
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
