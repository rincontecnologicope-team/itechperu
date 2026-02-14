import { siteConfig } from "@/config/site";
import { formatPenPlain } from "@/lib/format";

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function normalizeWhatsAppPhone(phone: string): string {
  const digits = sanitizePhone(phone);
  if (/^9\d{8}$/.test(digits)) {
    return `51${digits}`;
  }
  return digits;
}

export interface WhatsAppProductContext {
  model?: string;
  storage?: string;
  color?: string;
  productUrl?: string;
}

function cleanValue(value: string | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized : undefined;
}

export function createWhatsAppProductLink(
  productName: string,
  price: number,
  contextOrPhone?: WhatsAppProductContext | string,
  phoneArg?: string,
): string {
  const context: WhatsAppProductContext | undefined =
    typeof contextOrPhone === "string" ? undefined : contextOrPhone;
  const phone =
    typeof contextOrPhone === "string"
      ? contextOrPhone
      : phoneArg ?? siteConfig.whatsappPhone;
  const safeProductName = cleanValue(productName) ?? "producto";
  const parts = [
    "Hola, quiero informacion de este equipo:",
    `${safeProductName}`,
    `Precio: S/ ${formatPenPlain(price)}`,
  ];

  const model = cleanValue(context?.model);
  const storage = cleanValue(context?.storage);
  const color = cleanValue(context?.color);
  const productUrl = cleanValue(context?.productUrl);

  if (model) {
    parts.push(`Modelo: ${model}`);
  }
  if (storage) {
    parts.push(`Almacenamiento: ${storage}`);
  }
  if (color) {
    parts.push(`Color: ${color}`);
  }
  if (productUrl) {
    parts.push(`Link: ${productUrl}`);
  }

  parts.push("Me gustaria cerrar compra hoy. Quedo atento.");

  const message = parts.join("\n");
  const safePhone = normalizeWhatsAppPhone(phone);

  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppGenericLink(
  message: string,
  phone: string = siteConfig.whatsappPhone,
): string {
  const safePhone = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}
