import { uploadFirebaseProductImage } from "@/lib/catalog-firebase";
import { uploadCloudinaryProductImage } from "@/lib/cloudinary-storage";

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
  if (provider === "cloudinary") {
    return uploadCloudinaryProductImage(file);
  }

  throw new Error(
    `Proveedor de imagen '${provider}' no implementado todavia. Usa IMAGE_STORAGE_PROVIDER=firebase o cloudinary.`,
  );
}
