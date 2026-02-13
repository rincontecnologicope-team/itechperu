import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminLandingContent,
  normalizeLandingContentPayload,
  saveAdminLandingContent,
} from "@/lib/landing-content";

function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  try {
    const landingContent = await getAdminLandingContent();
    return NextResponse.json({ landingContent });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener contenido de la landing.";
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
    const normalized = normalizeLandingContentPayload(payload as Record<string, unknown>);
    const saved = await saveAdminLandingContent(normalized);
    return NextResponse.json({ landingContent: saved });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al guardar contenido de la landing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
