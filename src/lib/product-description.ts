const SECTION_LABEL_REGEX =
  /(?:modelo|pantalla|espacio|rendimiento|audio|c[aá]maras|seguridad|bater[ií]a|regalo|compra segura)\s*:/gi;

const MODEL_LINE_REGEX = /^[^A-Za-z0-9]*modelo\s*:/i;

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
    const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? normalized.length) : normalized.length;
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

export function removeModelLine(lines: string[]): string[] {
  return lines.filter((line) => !MODEL_LINE_REGEX.test(line));
}
