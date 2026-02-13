import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getFirebaseFirestore, isFirebaseCatalogConfigured } from "@/lib/firebase-admin";
import type { WhatsAppClickEventInput, WhatsAppMetrics } from "@/types/whatsapp-analytics";

const COLLECTION = "whatsapp_events";
const ANALYTICS_TIMEZONE = "America/Lima";
const DAILY_SERIES_DAYS = 14;

interface WhatsAppEventDoc {
  source: string;
  href: string;
  productId: string | null;
  productName: string | null;
  price: number | null;
  pagePath: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Timestamp;
}

export async function trackWhatsAppClick(
  input: WhatsAppClickEventInput & { userAgent?: string; ipAddress?: string },
): Promise<void> {
  if (!isFirebaseCatalogConfigured()) {
    return;
  }

  if (!input.source || !input.href) {
    return;
  }

  const db = getFirebaseFirestore();
  await db.collection(COLLECTION).add({
    source: input.source.trim(),
    href: input.href.trim(),
    productId: input.productId?.trim() || null,
    productName: input.productName?.trim() || null,
    price: Number.isFinite(input.price) ? Number(input.price) : null,
    pagePath: input.pagePath?.trim() || null,
    userAgent: input.userAgent?.trim() || null,
    ipAddress: input.ipAddress?.trim() || null,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function sortMapDesc(map: Map<string, number>) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }));
}

function formatDayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ANALYTICS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((item) => item.type === "year")?.value ?? "0000";
  const month = parts.find((item) => item.type === "month")?.value ?? "01";
  const day = parts.find((item) => item.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ANALYTICS_TIMEZONE,
    day: "2-digit",
    month: "short",
  }).format(date);
}

function buildDailySeries(dayCountMap: Map<string, number>) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const series = [];
  for (let offset = DAILY_SERIES_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(now - offset * dayMs);
    const key = formatDayKey(date);
    series.push({
      date: key,
      label: formatDayLabel(date),
      count: dayCountMap.get(key) ?? 0,
    });
  }
  return series;
}

export async function getWhatsAppMetrics(): Promise<WhatsAppMetrics> {
  const empty: WhatsAppMetrics = {
    totalClicks: 0,
    last7DaysClicks: 0,
    last24HoursClicks: 0,
    bySource: [],
    topProducts: [],
    dailySeries: [],
  };

  if (!isFirebaseCatalogConfigured()) {
    return empty;
  }

  const db = getFirebaseFirestore();
  const allSnapshot = await db.collection(COLLECTION).get();
  const allDocs = allSnapshot.docs.map((doc) => doc.data() as Partial<WhatsAppEventDoc>);
  if (allDocs.length === 0) {
    return empty;
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * dayMs;
  const oneDayAgo = now - dayMs;

  const bySource = new Map<string, number>();
  const byProduct = new Map<string, number>();
  const byDay = new Map<string, number>();
  let last7 = 0;
  let last24 = 0;

  for (const doc of allDocs) {
    const source = typeof doc.source === "string" ? doc.source : "unknown";
    bySource.set(source, (bySource.get(source) ?? 0) + 1);

    const productName = typeof doc.productName === "string" ? doc.productName : "";
    if (productName) {
      byProduct.set(productName, (byProduct.get(productName) ?? 0) + 1);
    }

    if (doc.createdAt instanceof Timestamp) {
      const createdAt = doc.createdAt.toMillis();
      const dayKey = formatDayKey(new Date(createdAt));
      byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
      if (createdAt >= sevenDaysAgo) {
        last7 += 1;
      }
      if (createdAt >= oneDayAgo) {
        last24 += 1;
      }
    }
  }

  return {
    totalClicks: allDocs.length,
    last7DaysClicks: last7,
    last24HoursClicks: last24,
    bySource: sortMapDesc(bySource).map((item) => ({
      source: item.key,
      count: item.value,
    })),
    topProducts: sortMapDesc(byProduct)
      .slice(0, 5)
      .map((item) => ({
        productName: item.key,
        count: item.value,
      })),
    dailySeries: buildDailySeries(byDay),
  };
}
