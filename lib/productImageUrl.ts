export function getProductImageUrl(barcode: string, size: "thumb" | "full"): string {
  return `https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(barcode)}/${size}.jpg`;
}
