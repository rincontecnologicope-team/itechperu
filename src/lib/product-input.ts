import { normalizeProductColors } from "@/lib/product-colors";
import { normalizeProductImages } from "@/lib/product-images";
import { slugify } from "@/lib/slug";
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductBadgeType,
  type ProductCategory,
} from "@/types/product";

interface ProductPayload {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  category?: unknown;
  model?: unknown;
  storage?: unknown;
  colors?: unknown;
  summary?: unknown;
  images?: unknown;
  highlights?: unknown;
  tags?: unknown;
  image?: unknown;
  badgeText?: unknown;
  badgeType?: unknown;
  conditionLabel?: unknown;
  price?: unknown;
  previousPrice?: unknown;
  baseStock?: unknown;
  isNewArrival?: unknown;
  isBestSeller?: unknown;
  featured?: unknown;
}

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim();
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeCategory(value: unknown): ProductCategory {
  if (typeof value === "string" && PRODUCT_CATEGORIES.includes(value as ProductCategory)) {
    return value as ProductCategory;
  }
  return "Celular";
}

function normalizeBadgeType(value: unknown): ProductBadgeType {
  if (value === "offer" || value === "score" || value === "new") {
    return value;
  }
  return "offer";
}

export function normalizeProductPayload(input: ProductPayload): Product {
  const name = normalizeString(input.name);
  if (!name) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  const slugRaw = normalizeString(input.slug) || slugify(name);
  if (!slugRaw) {
    throw new Error("No se pudo generar slug para el producto.");
  }

  const id = normalizeString(input.id) || slugRaw;
  const summary = normalizeString(input.summary);
  const model = normalizeString(input.model);
  const storage = normalizeString(input.storage);
  const colors = normalizeProductColors(input.colors);
  const image = normalizeString(input.image);
  const images = normalizeProductImages(input.images, image);
  const primaryImage = images.find((item) => item.isPrimary)?.url ?? images[0]?.url ?? "";
  const badgeText = normalizeString(input.badgeText);
  const conditionLabel = normalizeString(input.conditionLabel);

  if (!summary) {
    throw new Error("La descripcion corta (summary) es obligatoria.");
  }
  if (!primaryImage) {
    throw new Error("Debes cargar al menos una imagen del producto.");
  }
  if (!badgeText) {
    throw new Error("El texto de badge es obligatorio.");
  }
  if (!conditionLabel) {
    throw new Error("La condicion del producto es obligatoria.");
  }

  const price = Math.max(0, Math.round(normalizeNumber(input.price)));
  const previousPriceValue = normalizeNumber(input.previousPrice, NaN);
  const previousPrice = Number.isFinite(previousPriceValue)
    ? Math.max(0, Math.round(previousPriceValue))
    : undefined;
  const baseStock = Math.max(1, Math.round(normalizeNumber(input.baseStock, 1)));

  return {
    id,
    slug: slugRaw,
    name,
    category: normalizeCategory(input.category),
    model: model || undefined,
    storage: storage || undefined,
    colors,
    images,
    summary,
    highlights: normalizeStringArray(input.highlights),
    tags: normalizeStringArray(input.tags),
    image: primaryImage,
    badgeText,
    badgeType: normalizeBadgeType(input.badgeType),
    conditionLabel,
    price,
    previousPrice,
    baseStock,
    isNewArrival: normalizeBoolean(input.isNewArrival),
    isBestSeller: normalizeBoolean(input.isBestSeller),
    featured: normalizeBoolean(input.featured),
  };
}
