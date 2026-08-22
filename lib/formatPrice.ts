export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "—";
  }
  return `${price.toFixed(2)} дин.`;
}
