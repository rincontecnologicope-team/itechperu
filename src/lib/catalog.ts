import { catalogRepository } from "@/lib/catalog-repository";
import type { Product } from "@/types/product";

export async function getCatalogProducts(): Promise<Product[]> {
  return catalogRepository.listProducts();
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await catalogRepository.listProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return catalogRepository.getProductBySlug(slug);
}
