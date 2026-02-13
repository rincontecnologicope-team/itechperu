function normalizeEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export const siteConfig = {
  name: "iTech Peru",
  shortName: "iTech",
  description:
    "Tienda premium de tecnologia importada de USA con equipos verificados y atencion inmediata por WhatsApp.",
  url: normalizeEnv(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://itechperu.pe",
  whatsappPhone: normalizeEnv(process.env.NEXT_PUBLIC_WHATSAPP_PHONE) ?? "906431630",
  facebookMarketplaceUrl: "#catalogo",
  ogImage: "/og/itech-peru-og.svg",
};

export const defaultWhatsAppMessage =
  "Hola quiero informacion del catalogo disponible en iTech Peru";
