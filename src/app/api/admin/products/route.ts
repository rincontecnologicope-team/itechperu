import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminProducts, removeAdminProduct, saveAdminProduct } from "@/lib/catalog";
import { normalizeProductPayload } from "@/lib/product-input";

function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  try {
    const products = await getAdminProducts();
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al listar productos.";
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
    const product = normalizeProductPayload(payload as Record<string, unknown>);
    const saved = await saveAdminProduct(product);
    return NextResponse.json({ product: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar producto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedResponse();
  }

  let payload: { id?: string };
  try {
    payload = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const id = payload.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "id es obligatorio." }, { status: 400 });
  }

  try {
    await removeAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
