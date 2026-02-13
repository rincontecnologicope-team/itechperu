import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminHomeSectionsContent,
  normalizeHomeSectionsPayload,
  saveAdminHomeSectionsContent,
} from "@/lib/home-sections-content";

function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  try {
    const homeSections = await getAdminHomeSectionsContent();
    return NextResponse.json({ homeSections });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener configuracion de secciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  try {
    const normalized = normalizeHomeSectionsPayload(payload as Record<string, unknown>);
    const saved = await saveAdminHomeSectionsContent(normalized);
    return NextResponse.json({ homeSections: saved });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al guardar configuracion de secciones.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
