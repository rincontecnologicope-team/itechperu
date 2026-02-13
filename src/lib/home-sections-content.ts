import { faqs as defaultFaqs } from "@/data/faqs";
import { testimonials as defaultTestimonials } from "@/data/testimonials";
import { getFirebaseFirestore, isFirebaseCatalogConfigured } from "@/lib/firebase-admin";
import type {
  HomeSectionFaq,
  HomeSectionKey,
  HomeSectionTestimonial,
  HomeSectionsContent,
} from "@/types/home-sections";

const CONTENT_COLLECTION = "site_content";
const HOME_SECTIONS_DOC_ID = "home_sections";
const ORDER_FALLBACK: HomeSectionKey[] = ["testimonials", "payments", "faq"];
const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80";

export const DEFAULT_HOME_SECTIONS_CONTENT: HomeSectionsContent = {
  sectionOrder: ORDER_FALLBACK,
  testimonialsTitle: "⭐ Lo que dicen nuestros clientes",
  testimonialsSubtitle:
    "Experiencias reales de clientes peruanos que compraron con seguridad y atencion inmediata.",
  testimonials: defaultTestimonials.map((item) => ({
    ...item,
    rating: 5,
  })),
  paymentsTitle: "💳 Metodos de Pago Seguros",
  paymentsSubtitle: "Opciones flexibles para cerrar tu compra rapido y con total confianza.",
  bankTitle: "🏦 Transferencias bancarias",
  banks: ["BCP", "Interbank", "BBVA"],
  mobileTitle: "📱 Pagos moviles",
  mobileMethods: ["YAPE", "PLIN"],
  cashOnDeliveryText: "🚚 Contraentrega disponible",
  provinceShippingText: "📦 Envios a provincia via Shalom",
  faqTitle: "❓ Preguntas Frecuentes",
  faqSubtitle: "Resolvemos tus dudas antes de comprar",
  faqs: defaultFaqs,
};

function cloneDefaultHomeSectionsContent(): HomeSectionsContent {
  return {
    ...DEFAULT_HOME_SECTIONS_CONTENT,
    sectionOrder: [...DEFAULT_HOME_SECTIONS_CONTENT.sectionOrder],
    testimonials: DEFAULT_HOME_SECTIONS_CONTENT.testimonials.map((item) => ({ ...item })),
    banks: [...DEFAULT_HOME_SECTIONS_CONTENT.banks],
    mobileMethods: [...DEFAULT_HOME_SECTIONS_CONTENT.mobileMethods],
    faqs: DEFAULT_HOME_SECTIONS_CONTENT.faqs.map((item) => ({ ...item })),
  };
}

function asNonEmptyString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const normalized = value.map((item) => String(item).trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeOrder(value: unknown): HomeSectionKey[] {
  if (!Array.isArray(value)) {
    return ORDER_FALLBACK;
  }
  const valid = value
    .map((item) => String(item))
    .filter(
      (item): item is HomeSectionKey =>
        item === "testimonials" || item === "payments" || item === "faq",
    );

  const unique: HomeSectionKey[] = [];
  for (const item of valid) {
    if (!unique.includes(item)) {
      unique.push(item);
    }
  }
  for (const fallbackItem of ORDER_FALLBACK) {
    if (!unique.includes(fallbackItem)) {
      unique.push(fallbackItem);
    }
  }
  return unique;
}

function normalizeTestimonials(
  value: unknown,
  fallback: HomeSectionTestimonial[],
): HomeSectionTestimonial[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const source = item as Record<string, unknown>;
      return {
        id: asNonEmptyString(source.id, `testimonial-${index + 1}`),
        name: asNonEmptyString(source.name, `Cliente ${index + 1}`),
        text: asNonEmptyString(source.text, "Compra confirmada con exito."),
        avatar: asNonEmptyString(source.avatar, fallback[index]?.avatar ?? DEFAULT_AVATAR_URL),
        rating: Math.min(5, Math.max(1, Math.round(Number(source.rating) || 5))),
      };
    })
    .filter(Boolean) as HomeSectionTestimonial[];

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeFaqs(value: unknown, fallback: HomeSectionFaq[]): HomeSectionFaq[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const source = item as Record<string, unknown>;
      return {
        id: asNonEmptyString(source.id, `faq-${index + 1}`),
        question: asNonEmptyString(source.question, "Pregunta"),
        answer: asNonEmptyString(source.answer, "Respuesta"),
      };
    })
    .filter(Boolean) as HomeSectionFaq[];

  return normalized.length > 0 ? normalized : fallback;
}

function mergeHomeSectionsContent(
  partial: Partial<HomeSectionsContent> | null | undefined,
): HomeSectionsContent {
  const fallback = cloneDefaultHomeSectionsContent();
  if (!partial) {
    return fallback;
  }

  return {
    sectionOrder: normalizeOrder(partial.sectionOrder),
    testimonialsTitle: asNonEmptyString(partial.testimonialsTitle, fallback.testimonialsTitle),
    testimonialsSubtitle: asNonEmptyString(
      partial.testimonialsSubtitle,
      fallback.testimonialsSubtitle,
    ),
    testimonials: normalizeTestimonials(partial.testimonials, fallback.testimonials),
    paymentsTitle: asNonEmptyString(partial.paymentsTitle, fallback.paymentsTitle),
    paymentsSubtitle: asNonEmptyString(partial.paymentsSubtitle, fallback.paymentsSubtitle),
    bankTitle: asNonEmptyString(partial.bankTitle, fallback.bankTitle),
    banks: normalizeStringArray(partial.banks, fallback.banks),
    mobileTitle: asNonEmptyString(partial.mobileTitle, fallback.mobileTitle),
    mobileMethods: normalizeStringArray(partial.mobileMethods, fallback.mobileMethods),
    cashOnDeliveryText: asNonEmptyString(partial.cashOnDeliveryText, fallback.cashOnDeliveryText),
    provinceShippingText: asNonEmptyString(partial.provinceShippingText, fallback.provinceShippingText),
    faqTitle: asNonEmptyString(partial.faqTitle, fallback.faqTitle),
    faqSubtitle: asNonEmptyString(partial.faqSubtitle, fallback.faqSubtitle),
    faqs: normalizeFaqs(partial.faqs, fallback.faqs),
  };
}

export function normalizeHomeSectionsPayload(input: Record<string, unknown>): HomeSectionsContent {
  return mergeHomeSectionsContent(input as Partial<HomeSectionsContent>);
}

export function isHomeSectionsConfigured(): boolean {
  return isFirebaseCatalogConfigured();
}

export async function getHomeSectionsContent(): Promise<HomeSectionsContent> {
  if (!isHomeSectionsConfigured()) {
    return cloneDefaultHomeSectionsContent();
  }

  try {
    const db = getFirebaseFirestore();
    const doc = await db.collection(CONTENT_COLLECTION).doc(HOME_SECTIONS_DOC_ID).get();
    return mergeHomeSectionsContent(doc.exists ? (doc.data() as Partial<HomeSectionsContent>) : null);
  } catch (error) {
    console.error("No se pudo obtener contenido de secciones home desde Firebase.", error);
    return cloneDefaultHomeSectionsContent();
  }
}

export async function getAdminHomeSectionsContent(): Promise<HomeSectionsContent> {
  if (!isHomeSectionsConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }
  return getHomeSectionsContent();
}

export async function saveAdminHomeSectionsContent(
  content: HomeSectionsContent,
): Promise<HomeSectionsContent> {
  if (!isHomeSectionsConfigured()) {
    throw new Error(
      "Firebase no esta configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }

  const db = getFirebaseFirestore();
  await db.collection(CONTENT_COLLECTION).doc(HOME_SECTIONS_DOC_ID).set(content, { merge: false });
  return content;
}
