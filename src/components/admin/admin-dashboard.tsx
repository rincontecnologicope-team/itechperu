"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LandingContentEditor } from "@/components/admin/landing-content-editor";
import { slugify } from "@/lib/slug";
import type { LandingContent } from "@/types/landing-content";
import { PRODUCT_CATEGORIES, type Product } from "@/types/product";

interface AdminDashboardProps {
  initialProducts: Product[];
  initialLandingContent: LandingContent;
  catalogConnected: boolean;
}

type BadgeType = Product["badgeType"];

interface ProductDraft {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  summary: string;
  highlightsText: string;
  tagsText: string;
  image: string;
  badgeText: string;
  badgeType: BadgeType;
  conditionLabel: string;
  price: string;
  previousPrice: string;
  baseStock: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  featured: boolean;
}

const BADGE_OPTIONS: Array<{ value: BadgeType; label: string }> = [
  { value: "offer", label: "Oferta" },
  { value: "score", label: "Score" },
  { value: "new", label: "Nuevo" },
];

function emptyDraft(): ProductDraft {
  return {
    id: "",
    slug: "",
    name: "",
    category: "Celular",
    summary: "",
    highlightsText: "",
    tagsText: "",
    image: "",
    badgeText: "Oferta",
    badgeType: "offer",
    conditionLabel: "9/10",
    price: "",
    previousPrice: "",
    baseStock: "1",
    isNewArrival: true,
    isBestSeller: false,
    featured: true,
  };
}

function draftFromProduct(product: Product): ProductDraft {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    summary: product.summary,
    highlightsText: product.highlights.join(", "),
    tagsText: product.tags.join(", "),
    image: product.image,
    badgeText: product.badgeText,
    badgeType: product.badgeType,
    conditionLabel: product.conditionLabel,
    price: String(product.price),
    previousPrice: product.previousPrice ? String(product.previousPrice) : "",
    baseStock: String(product.baseStock),
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    featured: product.featured,
  };
}

function parseList(text: string): string[] {
  return text
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sortProducts(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return Number(b.featured) - Number(a.featured);
    }
    return b.price - a.price;
  });
}

export function AdminDashboard({
  initialProducts,
  initialLandingContent,
  catalogConnected,
}: AdminDashboardProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(sortProducts(initialProducts));
  const [selectedId, setSelectedId] = useState<string | null>(initialProducts[0]?.id ?? null);
  const [draft, setDraft] = useState<ProductDraft>(
    initialProducts[0] ? draftFromProduct(initialProducts[0]) : emptyDraft(),
  );
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId],
  );

  function selectProduct(product: Product) {
    setSelectedId(product.id);
    setDraft(draftFromProduct(product));
    setError("");
    setStatus("");
  }

  function startNewProduct() {
    setSelectedId(null);
    setDraft(emptyDraft());
    setError("");
    setStatus("Modo nuevo producto.");
  }

  function updateDraft<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    setStatus("Subiendo imagen...");
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
      updateDraft("image", payload.imageUrl);
      setStatus("Imagen subida correctamente.");
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
    setStatus("Guardando producto...");

    try {
      const payload = {
        id: draft.id || slugify(draft.slug || draft.name),
        slug: draft.slug || slugify(draft.name),
        name: draft.name,
        category: draft.category,
        summary: draft.summary,
        highlights: parseList(draft.highlightsText),
        tags: parseList(draft.tagsText),
        image: draft.image,
        badgeText: draft.badgeText,
        badgeType: draft.badgeType,
        conditionLabel: draft.conditionLabel,
        price: Number(draft.price),
        previousPrice: draft.previousPrice ? Number(draft.previousPrice) : undefined,
        baseStock: Number(draft.baseStock),
        isNewArrival: draft.isNewArrival,
        isBestSeller: draft.isBestSeller,
        featured: draft.featured,
      };

      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) {
        throw new Error(data.error ?? "No se pudo guardar.");
      }

      setProducts((current) => {
        const withoutCurrent = current.filter((item) => item.id !== data.product?.id);
        return sortProducts([...withoutCurrent, data.product as Product]);
      });
      setSelectedId(data.product.id);
      setDraft(draftFromProduct(data.product));
      setStatus("Producto guardado correctamente.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Error al guardar producto.");
      setStatus("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedProduct) {
      return;
    }
    if (!window.confirm(`Eliminar ${selectedProduct.name}?`)) {
      return;
    }

    setDeleting(true);
    setError("");
    setStatus("Eliminando producto...");
    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProduct.id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar.");
      }

      const nextProducts = products.filter((item) => item.id !== selectedProduct.id);
      setProducts(nextProducts);
      if (nextProducts[0]) {
        selectProduct(nextProducts[0]);
      } else {
        startNewProduct();
      }
      setStatus("Producto eliminado.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Error al eliminar.");
      setStatus("");
    } finally {
      setDeleting(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const canSave = catalogConnected && !saving && !uploading && !deleting;

  return (
    <main className="min-h-screen bg-slate-100 pb-10">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Panel Admin
            </p>
            <h1 className="font-heading text-2xl font-semibold text-slate-950">iTech Peru</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Saliendo..." : "Cerrar sesion"}
          </button>
        </div>

        {!catalogConnected ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Configura Firebase para habilitar el panel: `FIREBASE_PROJECT_ID`,
            `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` y `FIREBASE_STORAGE_BUCKET`.
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Productos</p>
              <button
                type="button"
                onClick={startNewProduct}
                className="inline-flex min-h-9 items-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + Nuevo
              </button>
            </div>

            <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
              {products.map((product) => {
                const active = product.id === selectedId;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => selectProduct(product)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {product.slug}
                    </p>
                  </button>
                );
              })}
              {products.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                  Todavia no hay productos guardados.
                </p>
              ) : null}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre
                </span>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categoria
                </span>
                <select
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft("category", event.target.value as Product["category"])
                  }
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slug
                </span>
                <input
                  value={draft.slug}
                  onChange={(event) => updateDraft("slug", slugify(event.target.value))}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const slug = slugify(draft.name);
                  updateDraft("slug", slug);
                  if (!draft.id) {
                    updateDraft("id", slug);
                  }
                }}
                className="mt-[22px] inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Generar slug
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Precio
                </span>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(event) => updateDraft("price", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Precio anterior
                </span>
                <input
                  type="number"
                  value={draft.previousPrice}
                  onChange={(event) => updateDraft("previousPrice", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock base
                </span>
                <input
                  type="number"
                  value={draft.baseStock}
                  onChange={(event) => updateDraft("baseStock", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
            </div>

            <label className="mt-3 grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Descripcion corta
              </span>
              <textarea
                rows={3}
                value={draft.summary}
                onChange={(event) => updateDraft("summary", event.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Highlights (coma o salto de linea)
                </span>
                <textarea
                  rows={3}
                  value={draft.highlightsText}
                  onChange={(event) => updateDraft("highlightsText", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tags (coma o salto de linea)
                </span>
                <textarea
                  rows={3}
                  value={draft.tagsText}
                  onChange={(event) => updateDraft("tagsText", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Badge tipo
                </span>
                <select
                  value={draft.badgeType}
                  onChange={(event) => updateDraft("badgeType", event.target.value as BadgeType)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  {BADGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Badge texto
                </span>
                <input
                  value={draft.badgeText}
                  onChange={(event) => updateDraft("badgeText", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Condicion
                </span>
                <input
                  value={draft.conditionLabel}
                  onChange={(event) => updateDraft("conditionLabel", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  URL imagen
                </span>
                <input
                  value={draft.image}
                  onChange={(event) => updateDraft("image", event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </label>
              <label className="mt-[22px] inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                {uploading ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!catalogConnected || uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                  }}
                />
              </label>
            </div>

            {draft.image ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.image}
                  alt={draft.name || "preview"}
                  className="mt-2 h-36 w-full rounded-xl object-cover"
                />
              </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.isNewArrival}
                  onChange={(event) => updateDraft("isNewArrival", event.target.checked)}
                />
                Nuevo ingreso
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.isBestSeller}
                  onChange={(event) => updateDraft("isBestSeller", event.target.checked)}
                />
                Mas vendido
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => updateDraft("featured", event.target.checked)}
                />
                Destacado
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

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar producto"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!selectedProduct || deleting || !catalogConnected}
                className="inline-flex min-h-11 items-center rounded-xl border border-rose-300 px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Eliminando..." : "Eliminar producto"}
              </button>
              <button
                type="button"
                onClick={startNewProduct}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpiar formulario
              </button>
            </div>
          </section>
        </div>

        <LandingContentEditor initialContent={initialLandingContent} enabled={catalogConnected} />
      </section>
    </main>
  );
}
