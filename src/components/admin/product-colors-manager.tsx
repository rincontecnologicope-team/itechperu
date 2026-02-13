"use client";

import { Plus, Trash2 } from "lucide-react";

import { buildEmptyColor, hexToRgb, normalizeProductColors, rgbToHex } from "@/lib/product-colors";
import type { ProductColor } from "@/types/product";

interface ProductColorsManagerProps {
  colors: ProductColor[];
  enabled: boolean;
  onChange: (colors: ProductColor[]) => void;
}

export function ProductColorsManager({ colors, enabled, onChange }: ProductColorsManagerProps) {
  const normalizedColors = normalizeProductColors(colors);

  function updateColor(index: number, partial: Partial<ProductColor>) {
    const next = normalizedColors.map((color, currentIndex) =>
      currentIndex === index ? { ...color, ...partial } : color,
    );
    onChange(normalizeProductColors(next));
  }

  function updateRgb(index: number, channel: "r" | "g" | "b", value: string) {
    const current = normalizedColors[index];
    if (!current) {
      return;
    }

    const rgb = hexToRgb(current.hex);
    if (!rgb) {
      return;
    }

    const numeric = Number(value);
    const safeValue = Number.isFinite(numeric) ? Math.max(0, Math.min(255, Math.round(numeric))) : 0;
    const nextRgb = { ...rgb, [channel]: safeValue };
    updateColor(index, { hex: rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b) });
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Colores RGB</p>
          <p className="mt-1 text-xs text-slate-600">
            Opcional. Puedes agregar varios colores por producto.
          </p>
        </div>
        <button
          type="button"
          disabled={!enabled}
          onClick={() => onChange(normalizeProductColors([...normalizedColors, buildEmptyColor(normalizedColors.length)]))}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-3.5" />
          Agregar color
        </button>
      </div>

      {normalizedColors.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500">
          Sin colores definidos.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {normalizedColors.map((color, index) => {
            const rgb = hexToRgb(color.hex);
            return (
              <article key={`${color.hex}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                  <label className="grid gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Picker
                    </span>
                    <input
                      type="color"
                      value={color.hex}
                      disabled={!enabled}
                      onChange={(event) => updateColor(index, { hex: event.target.value })}
                      className="h-11 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Nombre (opcional)
                      </span>
                      <input
                        value={color.name}
                        disabled={!enabled}
                        onChange={(event) => updateColor(index, { name: event.target.value })}
                        placeholder="Ej: Azul Pacifico"
                        className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        HEX
                      </span>
                      <input
                        value={color.hex}
                        readOnly
                        className="min-h-10 rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm text-slate-900 uppercase outline-none"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={!enabled}
                    onClick={() =>
                      onChange(normalizeProductColors(normalizedColors.filter((_, currentIndex) => currentIndex !== index)))
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">R</span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb?.r ?? 0}
                      disabled={!enabled}
                      onChange={(event) => updateRgb(index, "r", event.target.value)}
                      className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">G</span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb?.g ?? 0}
                      disabled={!enabled}
                      onChange={(event) => updateRgb(index, "g", event.target.value)}
                      className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">B</span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb?.b ?? 0}
                      disabled={!enabled}
                      onChange={(event) => updateRgb(index, "b", event.target.value)}
                      className="min-h-9 rounded-lg border border-slate-300 px-2 text-sm text-slate-900 outline-none focus:border-slate-900"
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
