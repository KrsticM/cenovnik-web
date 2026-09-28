export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "—";
  }
  return `${price.toLocaleString("sr-RS", { maximumFractionDigits: 2 })} RSD`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return many;
  if (m10 === 1) return one;
  if (m10 >= 2 && m10 <= 4) return few;
  return many;
}
