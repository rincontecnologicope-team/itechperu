function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function calculateSimulatedStock(
  productId: string,
  baseStock: number,
): number {
  const today = new Date();
  const daySeed =
    today.getUTCFullYear() * 1000 + (today.getUTCMonth() + 1) * 50 + today.getUTCDate();
  const hash = hashText(productId);
  const stockAdjustment = (daySeed + hash) % 3;

  return Math.max(1, baseStock - stockAdjustment);
}
