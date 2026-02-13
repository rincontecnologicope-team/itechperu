import { catalogRepository } from "@/lib/catalog-repository";
import {
  deleteFirebaseProduct,
  getFirebaseProductBySlug,
  isFirebaseCatalogConfigured,
  listFirebaseProducts,
  upsertFirebaseProduct,
} from "@/lib/catalog-firebase";
import type { Product } from "@/types/product";

export async function getCatalogProducts(): Promise<Product[]> {
  if (isFirebaseCatalogConfigured()) {
    try {
      return await listFirebaseProducts();
    } catch (error) {
      console.error("Catalogo Firebase no disponible, usando fallback JSON.", error);
    }
  }
  return catalogRepository.listProducts();
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getCatalogProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isFirebaseCatalogConfigured()) {
    try {
      return await getFirebaseProductBySlug(slug);
    } catch (error) {
      console.error("Producto Firebase no disponible, usando fallback JSON.", error);
    }
  }
  return catalogRepository.getProductBySlug(slug);
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!isFirebaseCatalogConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }
  return listFirebaseProducts();
}

export async function saveAdminProduct(product: Product): Promise<Product> {
  if (!isFirebaseCatalogConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }
  return upsertFirebaseProduct(product);
}

export async function removeAdminProduct(id: string): Promise<void> {
  if (!isFirebaseCatalogConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }
  return deleteFirebaseProduct(id);
}
