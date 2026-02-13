import { getFirebaseFirestore, isFirebaseCatalogConfigured } from "@/lib/firebase-admin";
import type { LandingContent } from "@/types/landing-content";

const CONTENT_COLLECTION = "site_content";
const LANDING_DOC_ID = "landing";

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  heroEyebrow: "Tecnologia verificada y garantizada",
  heroTitle: "Tecnologia importada de USA al mejor precio en Peru",
  heroDescription:
    "Equipos de segunda mano en estado premium, revisados por especialistas y listos para entrega rapida. Ya tenemos {count}+ productos en stock para despacho inmediato.",
  heroPrimaryCtaLabel: "Ver Productos",
  heroSecondaryCtaLabel: "Contactar por WhatsApp",
  heroCardEyebrow: "Seleccion premium",
  heroCardTitle: "Equipos listos para hoy",
  heroImageUrl: "",
  heroImageAlt: "Coleccion premium de equipos iTech Peru",
  catalogEyebrow: "Catalogo",
  catalogTitle: "Productos listos para entrega inmediata",
  catalogDescription:
    "Seleccion curada para usuarios que ya llegan con intencion de compra. Cada equipo incluye estado real, precio transparente y boton directo a WhatsApp.",
  trustEyebrow: "Confianza",
  trustTitle: "Compras con respaldo real",
  trustDescription:
    "Diseno limpio y transparente para reducir dudas en segundos y acelerar la decision de compra desde movil.",
  urgencyEyebrow: "Urgencia",
  urgencyTitle: "Se agotan rapido",
  urgencyDescription:
    "Stock actualizado de forma dinamica para reflejar la disponibilidad del dia y activar accion inmediata.",
};

type LandingContentRecord = Record<keyof LandingContent, string>;

function ensureString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}

function mergeLandingContent(partial: Partial<LandingContent> | null | undefined): LandingContent {
  if (!partial) {
    return { ...DEFAULT_LANDING_CONTENT };
  }

  const keys = Object.keys(DEFAULT_LANDING_CONTENT) as Array<keyof LandingContent>;
  const merged = {} as LandingContentRecord;
  for (const key of keys) {
    merged[key] = ensureString(partial[key], DEFAULT_LANDING_CONTENT[key]);
  }
  return merged;
}

export function normalizeLandingContentPayload(input: Record<string, unknown>): LandingContent {
  const keys = Object.keys(DEFAULT_LANDING_CONTENT) as Array<keyof LandingContent>;
  const normalized = {} as LandingContentRecord;
  for (const key of keys) {
    normalized[key] = ensureString(input[key], DEFAULT_LANDING_CONTENT[key]);
  }
  return normalized;
}

export function isLandingContentConfigured(): boolean {
  return isFirebaseCatalogConfigured();
}

export async function getLandingContent(): Promise<LandingContent> {
  if (!isLandingContentConfigured()) {
    return { ...DEFAULT_LANDING_CONTENT };
  }

  try {
    const db = getFirebaseFirestore();
    const doc = await db.collection(CONTENT_COLLECTION).doc(LANDING_DOC_ID).get();
    return mergeLandingContent(doc.exists ? (doc.data() as Partial<LandingContent>) : null);
  } catch (error) {
    console.error("No se pudo obtener landing content desde Firebase, usando fallback.", error);
    return { ...DEFAULT_LANDING_CONTENT };
  }
}

export async function getAdminLandingContent(): Promise<LandingContent> {
  if (!isLandingContentConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }
  return getLandingContent();
}

export async function saveAdminLandingContent(content: LandingContent): Promise<LandingContent> {
  if (!isLandingContentConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }

  const db = getFirebaseFirestore();
  await db.collection(CONTENT_COLLECTION).doc(LANDING_DOC_ID).set(content, { merge: false });
  return content;
}
