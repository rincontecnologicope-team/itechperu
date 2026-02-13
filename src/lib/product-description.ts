const SECTION_LABEL_REGEX =
  /(?:modelo|pantalla|espacio|almacenamiento|storage|color(?:es)?|rendimiento|audio|c[aá]maras|seguridad|bater[ií]a|regalo|compra segura)\s*:/gi;

const MODEL_LINE_REGEX = /^[^A-Za-z0-9]*modelo\s*:/i;
const STORAGE_LINE_REGEX = /^[^A-Za-z0-9]*(?:espacio|almacenamiento|storage)\s*:/i;
const COLORS_LINE_REGEX = /^[^A-Za-z0-9]*color(?:es)?\s*:/i;

const COLOR_NAME_TO_HEX: Record<string, string> = {
  negro: "#111827",
  blanco: "#F8FAFC",
  azul: "#2563EB",
  rojo: "#DC2626",
  verde: "#16A34A",
  dorado: "#C8A45A",
  gris: "#6B7280",
  plata: "#94A3B8",
  morado: "#7C3AED",
  rosa: "#EC4899",
};

export function splitProductDescriptionLines(summary: string): string[] {
  const normalized = summary.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  if (normalized.includes("\n")) {
    return normalized
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const matches: RegExpExecArray[] = [];
  const matcher = new RegExp(SECTION_LABEL_REGEX.source, SECTION_LABEL_REGEX.flags);
  let match = matcher.exec(normalized);
  while (match) {
    matches.push(match);
    match = matcher.exec(normalized);
  }

  if (matches.length === 0) {
    return [normalized];
  }

  const lines: string[] = [];
  const firstIndex = matches[0]?.index ?? 0;
  const header = normalized.slice(0, firstIndex).trim();
  if (header) {
    lines.push(header);
  }

  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index]?.index ?? 0;
    const end =
      index + 1 < matches.length ? (matches[index + 1]?.index ?? normalized.length) : normalized.length;
    const line = normalized.slice(start, end).trim();
    if (line) {
      lines.push(line);
    }
  }

  return lines;
}

export function extractModelFromSummary(summary: string): string | undefined {
  const line = splitProductDescriptionLines(summary).find((item) => MODEL_LINE_REGEX.test(item));
  if (!line) {
    return undefined;
  }

  const cleaned = line.replace(/^[^A-Za-z0-9]*modelo\s*:/i, "").trim();
  return cleaned || undefined;
}

export function extractStorageFromSummary(summary: string): string | undefined {
  const line = splitProductDescriptionLines(summary).find((item) => STORAGE_LINE_REGEX.test(item));
  if (!line) {
    return undefined;
  }

  const cleaned = line.replace(/^[^A-Za-z0-9]*(?:espacio|almacenamiento|storage)\s*:/i, "").trim();
  return cleaned || undefined;
}

function mapColorNameToHex(name: string): string | null {
  const key = name.toLowerCase().trim();
  return COLOR_NAME_TO_HEX[key] ?? null;
}

export function extractColorsFromSummary(
  summary: string,
): Array<{ name: string; hex: string; order: number }> {
  const line = splitProductDescriptionLines(summary).find((item) => COLORS_LINE_REGEX.test(item));
  if (!line) {
    return [];
  }

  const raw = line.replace(/^[^A-Za-z0-9]*color(?:es)?\s*:/i, "").trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(/[;,\/|]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name, index) => {
      const hex = mapColorNameToHex(name) ?? "#64748B";
      return { name, hex, order: index };
    });
}

export function removeModelLine(lines: string[]): string[] {
  return lines.filter((line) => !MODEL_LINE_REGEX.test(line));
}

export function removeStorageLine(lines: string[]): string[] {
  return lines.filter((line) => !STORAGE_LINE_REGEX.test(line));
}

export function removeColorsLine(lines: string[]): string[] {
  return lines.filter((line) => !COLORS_LINE_REGEX.test(line));
}
