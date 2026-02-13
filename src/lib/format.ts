const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const plainPenFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPen(value: number): string {
  return penFormatter.format(value);
}

export function formatPenPlain(value: number): string {
  return plainPenFormatter.format(value);
}
