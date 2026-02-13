import { catalogRepository } from "@/lib/catalog-repository";
import {
  deleteSupabaseProduct,
  getSupabaseProductBySlug,
  isSupabaseCatalogConfigured,
  listSupabaseProducts,
  upsertSupabaseProduct,
} from "@/lib/catalog-supabase";
import type { Product } from "@/types/product";

export async function getCatalogProducts(): Promise<Product[]> {
  if (isSupabaseCatalogConfigured()) {
    try {
      return await listSupabaseProducts();
    } catch (error) {
      console.error("Catalogo Supabase no disponible, usando fallback JSON.", error);
    }
  }
  return catalogRepository.listProducts();
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await catalogRepository.listProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseCatalogConfigured()) {
    try {
      return await getSupabaseProductBySlug(slug);
    } catch (error) {
      console.error("Producto Supabase no disponible, usando fallback JSON.", error);
    }
  }
  return catalogRepository.getProductBySlug(slug);
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!isSupabaseCatalogConfigured()) {
    throw new Error(
      "Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return listSupabaseProducts();
}

export async function saveAdminProduct(product: Product): Promise<Product> {
  if (!isSupabaseCatalogConfigured()) {
    throw new Error(
      "Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return upsertSupabaseProduct(product);
}

export async function removeAdminProduct(id: string): Promise<void> {
  if (!isSupabaseCatalogConfigured()) {
    throw new Error(
      "Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return deleteSupabaseProduct(id);
}
