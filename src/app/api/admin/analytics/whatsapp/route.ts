import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWhatsAppMetrics } from "@/lib/whatsapp-analytics";

function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  try {
    const metrics = await getWhatsAppMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener metricas de WhatsApp.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
