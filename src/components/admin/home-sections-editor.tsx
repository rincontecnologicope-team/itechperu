"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type {
  HomeSectionFaq,
  HomeSectionKey,
  HomeSectionTestimonial,
  HomeSectionsContent,
} from "@/types/home-sections";

interface HomeSectionsEditorProps {
  initialContent: HomeSectionsContent;
  enabled: boolean;
}

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  testimonials: "Testimonios",
  payments: "Pagos",
  faq: "FAQ",
};

function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createTestimonial(index: number): HomeSectionTestimonial {
  return {
    id: `testimonial-${Date.now()}-${index}`,
    name: `Cliente ${index + 1}`,
    text: "Compra segura y atencion rapida.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80",
    rating: 5,
  };
}

function createFaq(index: number): HomeSectionFaq {
  return {
    id: `faq-${Date.now()}-${index}`,
    question: "Nueva pregunta",
    answer: "Nueva respuesta",
  };
}

export function HomeSectionsEditor({ initialContent, enabled }: HomeSectionsEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<HomeSectionsContent>(initialContent);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  function updateField<K extends keyof HomeSectionsContent>(key: K, value: HomeSectionsContent[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function moveSection(index: number, direction: "up" | "down") {
    setDraft((prev) => {
      const offset = direction === "up" ? -1 : 1;
      const target = index + offset;
      if (target < 0 || target >= prev.sectionOrder.length) {
        return prev;
      }
      const next = [...prev.sectionOrder];
      const current = next[index];
      next[index] = next[target];
      next[target] = current;
      return { ...prev, sectionOrder: next };
    });
  }

  function updateTestimonial<K extends keyof HomeSectionTestimonial>(
    index: number,
    key: K,
    value: HomeSectionTestimonial[K],
  ) {
    setDraft((prev) => {
      const next = [...prev.testimonials];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, testimonials: next };
    });
  }

  function addTestimonial() {
    setDraft((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, createTestimonial(prev.testimonials.length)],
    }));
  }

  function removeTestimonial(index: number) {
    setDraft((prev) => {
      if (prev.testimonials.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        testimonials: prev.testimonials.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function updateFaq<K extends keyof HomeSectionFaq>(index: number, key: K, value: HomeSectionFaq[K]) {
    setDraft((prev) => {
      const next = [...prev.faqs];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, faqs: next };
    });
  }

  function addFaq() {
    setDraft((prev) => ({
      ...prev,
      faqs: [...prev.faqs, createFaq(prev.faqs.length)],
    }));
  }

  function removeFaq(index: number) {
    setDraft((prev) => {
      if (prev.faqs.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        faqs: prev.faqs.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  async function handleAvatarUpload(index: number, file: File) {
    setUploadingIndex(index);
    setError("");
    setStatus("Subiendo avatar...");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { imageUrl?: string; error?: string };
      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error ?? "No se pudo subir el avatar.");
      }

      updateTestimonial(index, "avatar", payload.imageUrl);
      setStatus("Avatar actualizado.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error al subir avatar.");
      setStatus("");
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setStatus("Guardando secciones...");
    try {
      const response = await fetch("/api/admin/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as {
        homeSections?: HomeSectionsContent;
        error?: string;
      };
      if (!response.ok || !payload.homeSections) {
        throw new Error(payload.error ?? "No se pudo guardar.");
      }

      setDraft(payload.homeSections);
      setStatus("Secciones actualizadas correctamente.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error al guardar secciones.");
      setStatus("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Secciones editables
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold text-slate-950">
          Testimonios, pagos y FAQ
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Orden en la home
        </p>
        <div className="mt-3 grid gap-2">
          {draft.sectionOrder.map((section, index) => (
            <div
              key={`${section}-${index}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <p className="text-sm font-semibold text-slate-900">{SECTION_LABELS[section]}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(index, "up")}
                  className="inline-flex min-h-8 items-center rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={index === 0 || !enabled}
                >
                  Subir
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, "down")}
                  className="inline-flex min-h-8 items-center rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={index === draft.sectionOrder.length - 1 || !enabled}
                >
                  Bajar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-3 sm:p-4">
        <p className="text-sm font-semibold text-slate-900">Testimonios</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo
            </span>
            <input
              value={draft.testimonialsTitle}
              onChange={(event) => updateField("testimonialsTitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subtitulo
            </span>
            <input
              value={draft.testimonialsSubtitle}
              onChange={(event) => updateField("testimonialsSubtitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          {draft.testimonials.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </span>
                  <input
                    value={item.name}
                    onChange={(event) => updateTestimonial(index, "name", event.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rating (1-5)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={item.rating}
                    onChange={(event) =>
                      updateTestimonial(index, "rating", Math.min(5, Math.max(1, Number(event.target.value) || 5)))
                    }
                    className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Avatar URL
                  </span>
                  <input
                    value={item.avatar}
                    onChange={(event) => updateTestimonial(index, "avatar", event.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                  />
                </label>
                <label className="mt-[22px] inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                  {uploadingIndex === index ? "Subiendo..." : "Subir avatar"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={!enabled || uploadingIndex !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleAvatarUpload(index, file);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeTestimonial(index)}
                  className="mt-[22px] inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!enabled || draft.testimonials.length <= 1}
                >
                  Eliminar
                </button>
              </div>

              <label className="mt-3 grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Testimonio
                </span>
                <textarea
                  rows={2}
                  value={item.text}
                  onChange={(event) => updateTestimonial(index, "text", event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={addTestimonial}
          disabled={!enabled}
          className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Agregar testimonio
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-3 sm:p-4">
        <p className="text-sm font-semibold text-slate-900">Metodos de pago</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo
            </span>
            <input
              value={draft.paymentsTitle}
              onChange={(event) => updateField("paymentsTitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subtitulo
            </span>
            <input
              value={draft.paymentsSubtitle}
              onChange={(event) => updateField("paymentsSubtitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo transferencias
            </span>
            <input
              value={draft.bankTitle}
              onChange={(event) => updateField("bankTitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bancos (separados por coma)
            </span>
            <input
              value={draft.banks.join(", ")}
              onChange={(event) => updateField("banks", parseCommaSeparatedList(event.target.value))}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo pagos moviles
            </span>
            <input
              value={draft.mobileTitle}
              onChange={(event) => updateField("mobileTitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Metodos moviles (separados por coma)
            </span>
            <input
              value={draft.mobileMethods.join(", ")}
              onChange={(event) =>
                updateField("mobileMethods", parseCommaSeparatedList(event.target.value))
              }
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contraentrega
            </span>
            <input
              value={draft.cashOnDeliveryText}
              onChange={(event) => updateField("cashOnDeliveryText", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Envio a provincia
            </span>
            <input
              value={draft.provinceShippingText}
              onChange={(event) => updateField("provinceShippingText", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-3 sm:p-4">
        <p className="text-sm font-semibold text-slate-900">Preguntas frecuentes</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo
            </span>
            <input
              value={draft.faqTitle}
              onChange={(event) => updateField("faqTitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subtitulo
            </span>
            <input
              value={draft.faqSubtitle}
              onChange={(event) => updateField("faqSubtitle", event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          {draft.faqs.map((faq, index) => (
            <article key={faq.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pregunta
                </span>
                <input
                  value={faq.question}
                  onChange={(event) => updateFaq(index, "question", event.target.value)}
                  className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <label className="mt-3 grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Respuesta
                </span>
                <textarea
                  rows={3}
                  value={faq.answer}
                  onChange={(event) => updateFaq(index, "answer", event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>

              <button
                type="button"
                onClick={() => removeFaq(index)}
                disabled={!enabled || draft.faqs.length <= 1}
                className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Eliminar pregunta
              </button>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={addFaq}
          disabled={!enabled}
          className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Agregar pregunta
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {status}
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          disabled={!enabled || saving || uploadingIndex !== null}
          onClick={handleSave}
          className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar secciones"}
        </button>
      </div>
    </section>
  );
}
