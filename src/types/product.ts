export type ProductBadgeType = "offer" | "score" | "new";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "iPad" | "Laptop" | "Tablet" | "Reloj" | "Celular";
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
