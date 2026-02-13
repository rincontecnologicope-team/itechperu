import catalogSource from "@/data/products.json";
import type { Product } from "@/types/product";

interface CatalogDataFile {
  products: Product[];
}

export interface CatalogRepository {
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}

class JsonCatalogRepository implements CatalogRepository {
  private readonly products: Product[];

  constructor(source: CatalogDataFile) {
    this.products = source.products;
  }

  async listProducts(): Promise<Product[]> {
    return [...this.products].sort((a, b) => {
      if (a.featured !== b.featured) {
        return Number(b.featured) - Number(a.featured);
      }
      return b.price - a.price;
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = this.products.find((item) => item.slug === slug);
    return product ?? null;
  }
}

export const catalogRepository: CatalogRepository = new JsonCatalogRepository(
  catalogSource as CatalogDataFile,
);
