import { siteConfig } from "@/config/site";
import { formatPenPlain } from "@/lib/format";

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function createWhatsAppProductLink(
  productName: string,
  price: number,
  phone: string = siteConfig.whatsappPhone,
): string {
  const message = `Hola quiero informacion del ${productName} precio S/ ${formatPenPlain(price)}`;
  const safePhone = sanitizePhone(phone);

  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}

export function createWhatsAppGenericLink(
  message: string,
  phone: string = siteConfig.whatsappPhone,
): string {
  const safePhone = sanitizePhone(phone);
  return `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`;
}
