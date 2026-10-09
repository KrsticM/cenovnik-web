import { useHistoryParam } from "@/hooks/useHistoryParam";
import type { CatalogItem } from "@/lib/services/products";

export function useProductDetailParam(loaded: CatalogItem[]) {
  const { value: productId, open, close, restoreFocus } = useHistoryParam("proizvod");
  const knownProduct = loaded.find((item) => item.product.id === productId)?.product ?? null;
  return { productId, knownProduct, open, close, restoreFocus };
}
