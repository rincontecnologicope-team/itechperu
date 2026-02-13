"use client";

import { motion } from "framer-motion";

import { createWhatsAppGenericLink } from "@/lib/whatsapp";

const mobileMessage =
  "Hola quiero informacion inmediata de los productos de iTech Peru";

export function MobileWhatsAppBar() {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.6 }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden"
    >
      <a
        href={createWhatsAppGenericLink(mobileMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-whatsapp)] px-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(37,211,102,0.36)]"
      >
        Contactar por WhatsApp
      </a>
    </motion.div>
  );
}
