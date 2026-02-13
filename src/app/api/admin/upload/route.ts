import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadProductImage } from "@/lib/product-image-storage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Debes enviar un archivo en el campo 'image'." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Archivo demasiado grande. Maximo 8MB." },
      { status: 400 },
    );
  }

  try {
    const imageUrl = await uploadProductImage(file);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
