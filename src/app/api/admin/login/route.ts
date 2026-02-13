import { NextResponse } from "next/server";

import {
  attachAdminSessionCookie,
  isAdminPasswordConfigured,
  validateAdminPassword,
} from "@/lib/admin-auth";

interface LoginPayload {
  password?: string;
}

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD no configurado. Define la variable en Vercel para habilitar el panel.",
      },
      { status: 503 },
    );
  }

  let payload: LoginPayload;
  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const password = payload.password?.trim() ?? "";
  if (!password) {
    return NextResponse.json({ error: "La contrasena es obligatoria." }, { status: 400 });
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: "Credenciales invalidas." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return attachAdminSessionCookie(response);
}
