"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LandingContent } from "@/types/landing-content";

interface LandingContentEditorProps {
  initialContent: LandingContent;
  enabled: boolean;
}

export function LandingContentEditor({ initialContent, enabled }: LandingContentEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<LandingContent>(initialContent);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function updateField<K extends keyof LandingContent>(key: K, value: LandingContent[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    setStatus("Subiendo imagen de hero...");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { imageUrl?: string; error?: string };
      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error ?? "No se pudo subir la imagen.");
      }
      updateField("heroImageUrl", payload.imageUrl);
      setStatus("Imagen de hero actualizada.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error al subir imagen.");
      setStatus("");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setStatus("Guardando contenido...");
    try {
      const response = await fetch("/api/admin/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as {
        landingContent?: LandingContent;
        error?: string;
      };
      if (!response.ok || !payload.landingContent) {
        throw new Error(payload.error ?? "No se pudo guardar el contenido.");
      }
      setDraft(payload.landingContent);
      setStatus("Landing actualizada correctamente.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error al guardar contenido.");
      setStatus("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Landing editable
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold text-slate-950">
          Textos e imagen principal
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Usa {"{count}"} dentro de la descripcion del hero para mostrar cantidad de productos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hero eyebrow
          </span>
          <input
            value={draft.heroEyebrow}
            onChange={(event) => updateField("heroEyebrow", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hero titulo
          </span>
          <input
            value={draft.heroTitle}
            onChange={(event) => updateField("heroTitle", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Hero descripcion
        </span>
        <textarea
          rows={3}
          value={draft.heroDescription}
          onChange={(event) => updateField("heroDescription", event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            CTA principal
          </span>
          <input
            value={draft.heroPrimaryCtaLabel}
            onChange={(event) => updateField("heroPrimaryCtaLabel", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            CTA secundario
          </span>
          <input
            value={draft.heroSecondaryCtaLabel}
            onChange={(event) => updateField("heroSecondaryCtaLabel", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tarjeta hero eyebrow
          </span>
          <input
            value={draft.heroCardEyebrow}
            onChange={(event) => updateField("heroCardEyebrow", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tarjeta hero titulo
          </span>
          <input
            value={draft.heroCardTitle}
            onChange={(event) => updateField("heroCardTitle", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            URL imagen hero (opcional)
          </span>
          <input
            value={draft.heroImageUrl}
            onChange={(event) => updateField("heroImageUrl", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="mt-[22px] inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          {uploading ? "Subiendo..." : "Subir hero"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={!enabled || uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Alt de imagen hero
        </span>
        <input
          value={draft.heroImageAlt}
          onChange={(event) => updateField("heroImageAlt", event.target.value)}
          className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
        />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catalogo eyebrow
          </span>
          <input
            value={draft.catalogEyebrow}
            onChange={(event) => updateField("catalogEyebrow", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catalogo titulo
          </span>
          <input
            value={draft.catalogTitle}
            onChange={(event) => updateField("catalogTitle", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catalogo descripcion
          </span>
          <input
            value={draft.catalogDescription}
            onChange={(event) => updateField("catalogDescription", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confianza eyebrow
          </span>
          <input
            value={draft.trustEyebrow}
            onChange={(event) => updateField("trustEyebrow", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confianza titulo
          </span>
          <input
            value={draft.trustTitle}
            onChange={(event) => updateField("trustTitle", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confianza descripcion
          </span>
          <input
            value={draft.trustDescription}
            onChange={(event) => updateField("trustDescription", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Urgencia eyebrow
          </span>
          <input
            value={draft.urgencyEyebrow}
            onChange={(event) => updateField("urgencyEyebrow", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Urgencia titulo
          </span>
          <input
            value={draft.urgencyTitle}
            onChange={(event) => updateField("urgencyTitle", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Urgencia descripcion
          </span>
          <input
            value={draft.urgencyDescription}
            onChange={(event) => updateField("urgencyDescription", event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
          />
        </label>
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
          disabled={!enabled || saving || uploading}
          onClick={handleSave}
          className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar landing"}
        </button>
      </div>
    </section>
  );
}
