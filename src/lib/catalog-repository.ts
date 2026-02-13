import catalogSource from "@/data/products.json";
import { normalizeProductColors } from "@/lib/product-colors";
import { getPrimaryImageUrl, normalizeProductImages } from "@/lib/product-images";
import type { Product } from "@/types/product";

interface CatalogProductRaw extends Omit<Product, "images" | "colors"> {
  colors?: Product["colors"];
  images?: Product["images"];
}

interface CatalogDataFile {
  products: CatalogProductRaw[];
}

export interface CatalogRepository {
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}

class JsonCatalogRepository implements CatalogRepository {
  private readonly products: Product[];

  constructor(source: CatalogDataFile) {
    this.products = source.products.map((product) => {
      const images = normalizeProductImages((product as Partial<Product>).images, product.image);
      const primaryImage = getPrimaryImageUrl({
        image: product.image,
        images,
      });
      return {
        ...product,
        storage: typeof product.storage === "string" && product.storage.trim() ? product.storage : undefined,
        colors: normalizeProductColors(product.colors),
        images,
        image: primaryImage,
      } satisfies Product;
    });
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
