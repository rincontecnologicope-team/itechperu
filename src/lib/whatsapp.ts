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

export function createWhatsAppProductLink(
  productName: string,
  price: number,
  phone: string = siteConfig.whatsappPhone,
): string {
  const message = `Hola quiero informacion del ${productName} precio S/ ${formatPenPlain(price)}`;
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
