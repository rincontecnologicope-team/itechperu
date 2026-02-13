import { randomUUID } from "crypto";

import { getFirebaseBucket, getFirebaseFirestore, isFirebaseCatalogConfigured } from "@/lib/firebase-admin";
import type { Product, ProductBadgeType, ProductCategory } from "@/types/product";

interface ProductDoc {
  id: string;
  slug: string;
  name: string;
  category: string;
  model?: string | null;
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
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    category: normalizeCategory(data.category),
    model: typeof data.model === "string" && data.model.trim() ? data.model.trim() : undefined,
    summary: data.summary,
    highlights: data.highlights ?? [],
    tags: data.tags ?? [],
    image: data.image,
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
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    model: product.model ?? null,
    summary: product.summary,
    highlights: product.highlights,
    tags: product.tags,
    image: product.image,
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

export async function uploadFirebaseProductImage(file: File): Promise<string> {
  const bucket = getFirebaseBucket();
  const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `products/${Date.now()}-${Math.random().toString(16).slice(2)}-${cleanName}`;
  const token = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const object = bucket.file(path);

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
}
