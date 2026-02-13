import { uploadFirebaseProductImage } from "@/lib/catalog-firebase";

export type ImageStorageProvider = "firebase" | "cloudinary" | "supabase";

function getImageStorageProvider(): ImageStorageProvider {
  const provider = (process.env.IMAGE_STORAGE_PROVIDER ?? "firebase").trim().toLowerCase();
  if (provider === "cloudinary" || provider === "supabase" || provider === "firebase") {
    return provider;
  }
  return "firebase";
}

export async function uploadProductImage(file: File): Promise<string> {
  const provider = getImageStorageProvider();

  if (provider === "firebase") {
    return uploadFirebaseProductImage(file);
  }

  throw new Error(
    `Proveedor de imagen '${provider}' no implementado todavia. Configura IMAGE_STORAGE_PROVIDER=firebase por ahora.`,
  );
}
