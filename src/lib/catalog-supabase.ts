import { createClient } from "@supabase/supabase-js";

import type { Product, ProductBadgeType, ProductCategory } from "@/types/product";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  highlights: string[] | null;
  tags: string[] | null;
  image: string;
  badge_text: string;
  badge_type: string;
  condition_label: string;
  price: number;
  previous_price: number | null;
  base_stock: number;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  featured: boolean;
}

const PRODUCT_COLUMNS =
  "id, slug, name, category, summary, highlights, tags, image, badge_text, badge_type, condition_label, price, previous_price, base_stock, is_new_arrival, is_best_seller, featured";

function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isSupabaseCatalogConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

function getSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url || !key) {
    throw new Error(
      "Supabase no configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: normalizeCategory(row.category),
    summary: row.summary,
    highlights: row.highlights ?? [],
    tags: row.tags ?? [],
    image: row.image,
    badgeText: row.badge_text,
    badgeType: normalizeBadgeType(row.badge_type),
    conditionLabel: row.condition_label,
    price: Number(row.price),
    previousPrice: row.previous_price ?? undefined,
    baseStock: Number(row.base_stock),
    isNewArrival: Boolean(row.is_new_arrival),
    isBestSeller: Boolean(row.is_best_seller),
    featured: Boolean(row.featured),
  };
}

function mapProductToRow(product: Product): ProductRow {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    summary: product.summary,
    highlights: product.highlights,
    tags: product.tags,
    image: product.image,
    badge_text: product.badgeText,
    badge_type: product.badgeType,
    condition_label: product.conditionLabel,
    price: product.price,
    previous_price: product.previousPrice ?? null,
    base_stock: product.baseStock,
    is_new_arrival: product.isNewArrival,
    is_best_seller: product.isBestSeller,
    featured: product.featured,
  };
}

export async function listSupabaseProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("featured", { ascending: false })
    .order("price", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron listar productos: ${error.message}`);
  }

  return (data as ProductRow[]).map(mapRowToProduct);
}

export async function getSupabaseProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el producto: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRowToProduct(data as ProductRow);
}

export async function upsertSupabaseProduct(product: Product): Promise<Product> {
  const supabase = getSupabaseAdminClient();
  const row = mapProductToRow(product);

  const { data, error } = await supabase
    .from("products")
    .upsert([row], { onConflict: "id" })
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) {
    throw new Error(`No se pudo guardar el producto: ${error.message}`);
  }

  return mapRowToProduct(data as ProductRow);
}

export async function deleteSupabaseProduct(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el producto: ${error.message}`);
  }
}

export async function uploadSupabaseProductImage(file: File): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const bucket = process.env.SUPABASE_BUCKET ?? "product-images";
  const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(16).slice(2)}-${cleanName}`;
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(`No se pudo subir imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
