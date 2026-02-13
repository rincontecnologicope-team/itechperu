import type { ProductColor } from "@/types/product";

interface ProductColorInput {
  name?: unknown;
  hex?: unknown;
  order?: unknown;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6})$/;
const SHORT_HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3})$/;

export function normalizeHexColor(input: string): string | null {
  const normalized = input.trim();
  if (!normalized) {
    return null;
  }

  const withHash = normalized.startsWith("#") ? normalized : `#${normalized}`;
  if (SHORT_HEX_COLOR_REGEX.test(withHash)) {
    const short = withHash.slice(1).toUpperCase();
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`;
  }
  if (!HEX_COLOR_REGEX.test(withHash)) {
    return null;
  }

  return withHash.toUpperCase();
}

function toColorItems(input: unknown): ProductColorInput[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((item) => item && typeof item === "object") as ProductColorInput[];
}

export function normalizeProductColors(input: unknown): ProductColor[] {
  const raw = toColorItems(input);
  const mapped = raw
    .map((item, index) => {
      const hex = normalizeHexColor(String(item.hex ?? ""));
      if (!hex) {
        return null;
      }

      const name = String(item.name ?? "").trim();
      const order = Number.isFinite(Number(item.order)) ? Number(item.order) : index;
      return {
        name,
        hex,
        order,
      };
    })
    .filter((item): item is ProductColor => Boolean(item))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }));

  return mapped;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const safe = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const toHex = (value: number) => safe(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const safeHex = normalizeHexColor(hex);
  if (!safeHex) {
    return null;
  }

  const value = safeHex.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

export function buildEmptyColor(index: number): ProductColor {
  return {
    name: "",
    hex: "#111827",
    order: index,
  };
}
