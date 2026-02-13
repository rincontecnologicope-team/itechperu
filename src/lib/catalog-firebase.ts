import { randomUUID } from "crypto";

import {
  getFirebaseBucket,
  getFirebaseFirestore,
  getFirebaseProjectIdValue,
  getFirebaseStorageBucketCandidates,
  listFirebaseStorageBuckets,
  isFirebaseCatalogConfigured,
} from "@/lib/firebase-admin";
import { normalizeProductColors } from "@/lib/product-colors";
import { getPrimaryImageUrl, normalizeProductImages } from "@/lib/product-images";
import type { Product, ProductBadgeType, ProductCategory } from "@/types/product";

interface ProductImageDoc {
  url: string;
  order: number;
  isPrimary: boolean;
}

interface ProductDoc {
  id: string;
  slug: string;
  name: string;
  category: string;
  model?: string | null;
  storage?: string | null;
  colors?: Array<{ name?: string; hex?: string; order?: number }> | null;
  images?: ProductImageDoc[] | null;
  summary: string;
  highlights: string[] | null;
  tags: string[] | null;
  image: string;
  badgeText: string;
  badgeType: string;
  conditionLabel: string;
  price: number;
  previousPrice?: number | null;
  baseStock: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  featured: boolean;
}

function normalizeBadgeType(value: string): ProductBadgeType {
  if (value === "offer" || value === "score" || value === "new") {
    return value;
  }
  return "offer";
}

function normalizeCategory(value: string): ProductCategory {
  if (
    value === "iPad" ||
    value === "Laptop" ||
    value === "Tablet" ||
    value === "Reloj" ||
    value === "Celular"
  ) {
    return value;
  }
  return "Celular";
}

function mapDocToProduct(data: ProductDoc): Product {
  const images = normalizeProductImages(data.images, data.image);
  const primaryImage = images.find((item) => item.isPrimary)?.url ?? images[0]?.url ?? data.image;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    category: normalizeCategory(data.category),
    model: typeof data.model === "string" && data.model.trim() ? data.model.trim() : undefined,
    storage:
      typeof data.storage === "string" && data.storage.trim() ? data.storage.trim() : undefined,
    colors: normalizeProductColors(data.colors),
    images,
    summary: data.summary,
    highlights: data.highlights ?? [],
    tags: data.tags ?? [],
    image: primaryImage,
    badgeText: data.badgeText,
    badgeType: normalizeBadgeType(data.badgeType),
    conditionLabel: data.conditionLabel,
    price: Number(data.price),
    previousPrice: data.previousPrice ?? undefined,
    baseStock: Number(data.baseStock),
    isNewArrival: Boolean(data.isNewArrival),
    isBestSeller: Boolean(data.isBestSeller),
    featured: Boolean(data.featured),
  };
}

function mapProductToDoc(product: Product): ProductDoc {
  const images = normalizeProductImages(product.images, product.image);
  const primaryImage = getPrimaryImageUrl({
    image: product.image,
    images,
  });

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    model: product.model ?? null,
    storage: product.storage ?? null,
    colors: normalizeProductColors(product.colors).map((color) => ({
      name: color.name,
      hex: color.hex,
      order: color.order,
    })),
    images: images.map((image) => ({
      url: image.url,
      order: image.order,
      isPrimary: image.isPrimary,
    })),
    summary: product.summary,
    highlights: product.highlights,
    tags: product.tags,
    image: primaryImage,
    badgeText: product.badgeText,
    badgeType: product.badgeType,
    conditionLabel: product.conditionLabel,
    price: product.price,
    previousPrice: product.previousPrice ?? null,
    baseStock: product.baseStock,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    featured: product.featured,
  };
}

function sortProducts(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return Number(b.featured) - Number(a.featured);
    }
    return b.price - a.price;
  });
}

export { isFirebaseCatalogConfigured };

export async function listFirebaseProducts(): Promise<Product[]> {
  const db = getFirebaseFirestore();
  const snapshot = await db.collection("products").get();
  const products = snapshot.docs.map((doc) => mapDocToProduct(doc.data() as ProductDoc));
  return sortProducts(products);
}

export async function getFirebaseProductBySlug(slug: string): Promise<Product | null> {
  const db = getFirebaseFirestore();
  const query = await db.collection("products").where("slug", "==", slug).limit(1).get();
  const first = query.docs[0];
  if (!first) {
    return null;
  }
  return mapDocToProduct(first.data() as ProductDoc);
}

export async function upsertFirebaseProduct(product: Product): Promise<Product> {
  const db = getFirebaseFirestore();
  const payload = mapProductToDoc(product);
  await db.collection("products").doc(product.id).set(payload, { merge: false });
  return product;
}

export async function deleteFirebaseProduct(id: string): Promise<void> {
  const db = getFirebaseFirestore();
  await db.collection("products").doc(id).delete();
}

function isBucketNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const raw = error as { message?: string; code?: string | number };
  const message = String(raw.message ?? "");
  const code = String(raw.code ?? "");

  return (
    /specified bucket does not exist/i.test(message) ||
    /bucket.*not found/i.test(message) ||
    /no such bucket/i.test(message) ||
    code === "404" ||
    code.toLowerCase().includes("not-found")
  );
}

export async function uploadFirebaseProductImage(file: File): Promise<string> {
  const initialCandidates = getFirebaseStorageBucketCandidates();
  const discoveredBuckets = await listFirebaseStorageBuckets();
  const bucketCandidates = Array.from(new Set([...initialCandidates, ...discoveredBuckets]));
  if (bucketCandidates.length === 0) {
    throw new Error("FIREBASE_STORAGE_BUCKET no configurado.");
  }

  const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `products/${Date.now()}-${Math.random().toString(16).slice(2)}-${cleanName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  let lastBucketError: unknown;

  for (const candidate of bucketCandidates) {
    const bucket = getFirebaseBucket(candidate);
    const token = randomUUID();
    const object = bucket.file(path);

    try {
      await object.save(buffer, {
        metadata: {
          contentType: file.type || "application/octet-stream",
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
          cacheControl: "public,max-age=3600",
        },
        public: false,
        validation: "crc32c",
      });

      return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    } catch (error) {
      lastBucketError = error;
      if (isBucketNotFoundError(error)) {
        continue;
      }
      throw error;
    }
  }

  const suffix =
    lastBucketError instanceof Error ? ` Detalle: ${lastBucketError.message}` : "";
  const projectId = getFirebaseProjectIdValue();
  const candidateList = bucketCandidates.join(", ");
  throw new Error(
    `No se encontro un bucket de Storage valido para el proyecto ${projectId ?? "desconocido"}. Buckets probados: ${candidateList}. Verifica FIREBASE_STORAGE_BUCKET o activa Firebase Storage en consola.${suffix}`,
  );
}
