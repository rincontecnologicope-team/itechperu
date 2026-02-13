import { NextResponse } from "next/server";

import { trackWhatsAppClick } from "@/lib/whatsapp-analytics";
import type { WhatsAppClickEventInput } from "@/types/whatsapp-analytics";

interface RequestWithIpHeaders extends Request {
  ip?: string;
}

function getClientIp(request: RequestWithIpHeaders): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  return request.ip ?? "";
}

export async function POST(request: RequestWithIpHeaders) {
  let payload: Partial<WhatsAppClickEventInput>;
  try {
    payload = (await request.json()) as Partial<WhatsAppClickEventInput>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const source = payload.source?.trim() ?? "";
  const href = payload.href?.trim() ?? "";
  if (!source || !href || !/^https:\/\/wa\.me\/.+/i.test(href)) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await trackWhatsAppClick({
      source,
      href,
      productId: payload.productId,
      productName: payload.productName,
      price: payload.price,
      pagePath: payload.pagePath,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: getClientIp(request) || undefined,
    });
  } catch (error) {
    console.error("No se pudo registrar evento WhatsApp:", error);
  }

  return new NextResponse(null, { status: 204 });
}
