
export const FALLBACK_PRODUCT_NAME = "Proizvod";

export function primaryBarcode(barcodes: { barcode: string }[] | null | undefined): string | null {
  const sorted = (barcodes ?? []).map((b) => b.barcode).sort();
  return sorted[0] ?? null;
}
