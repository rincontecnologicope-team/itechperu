import type { Product, ProductImage } from "@/types/product";

interface ProductImageInput {
  url?: unknown;
  order?: unknown;
  isPrimary?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeUrl(value: unknown): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }
  return value.trim();
}

function toImageItems(input: unknown): ProductImageInput[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((item) => item && typeof item === "object") as ProductImageInput[];
}

export function normalizeProductImages(input: unknown, fallbackUrl?: string): ProductImage[] {
  const rawItems = toImageItems(input);

  const mapped = rawItems
    .map((item, index) => {
      const url = normalizeUrl(item.url);
      if (!url) {
        return null;
      }
      return {
        url,
        order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
        isPrimary: item.isPrimary === true,
      };
    })
    .filter((item): item is ProductImage => Boolean(item));

  if (mapped.length === 0) {
    const safeFallback = normalizeUrl(fallbackUrl);
    if (!safeFallback) {
      return [];
    }
    return [{ url: safeFallback, order: 0, isPrimary: true }];
  }

  const sorted = [...mapped].sort((a, b) => a.order - b.order);
  let hasPrimary = false;
  const normalized = sorted.map((item, index) => {
    const isPrimary = item.isPrimary && !hasPrimary;
    if (isPrimary) {
      hasPrimary = true;
    }
    return {
      url: item.url,
      order: index,
      isPrimary,
    };
  });

  if (!hasPrimary && normalized[0]) {
    normalized[0] = { ...normalized[0], isPrimary: true };
  }

  return normalized;
}

export function getPrimaryImageUrl(product: Pick<Product, "image" | "images">): string {
  const normalized = normalizeProductImages(product.images, product.image);
  const primary = normalized.find((image) => image.isPrimary) ?? normalized[0];
  return primary?.url ?? product.image;
}

export function moveProductImage(
  images: ProductImage[],
  fromIndex: number,
  toIndex: number,
): ProductImage[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return normalizeProductImages(images);
  }
  if (fromIndex >= images.length || toIndex >= images.length) {
    return normalizeProductImages(images);
  }

  const next = [...images];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return normalizeProductImages(next);
}

export function removeProductImage(images: ProductImage[], index: number): ProductImage[] {
  if (index < 0 || index >= images.length) {
    return normalizeProductImages(images);
  }
  const next = images.filter((_, currentIndex) => currentIndex !== index);
  return normalizeProductImages(next);
}

export function setPrimaryProductImage(images: ProductImage[], index: number): ProductImage[] {
  if (index < 0 || index >= images.length) {
    return normalizeProductImages(images);
  }
  const next = images.map((image, currentIndex) => ({
    ...image,
    isPrimary: currentIndex === index,
  }));
  return normalizeProductImages(next);
}
