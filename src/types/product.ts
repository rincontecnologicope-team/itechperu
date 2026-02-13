export type ProductBadgeType = "offer" | "score" | "new";
export type ProductCategory = "iPad" | "Laptop" | "Tablet" | "Reloj" | "Celular";

export interface ProductImage {
  url: string;
  order: number;
  isPrimary: boolean;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "iPad",
  "Laptop",
  "Tablet",
  "Reloj",
  "Celular",
];

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  model?: string;
  images: ProductImage[];
  summary: string;
  highlights: string[];
  tags: string[];
  image: string;
  badgeText: string;
  badgeType: ProductBadgeType;
  conditionLabel: string;
  price: number;
  previousPrice?: number;
  baseStock: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  featured: boolean;
}
