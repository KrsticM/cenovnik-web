import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogItem } from "@/lib/services/products";

const PARAM = "proizvod";

function urlWith(productId: string | null): string {
  const url = new URL(window.location.href);
  if (productId) url.searchParams.set(PARAM, productId);
  else url.searchParams.delete(PARAM);
  return url.toString();
}

export function useProductDetailParam(loaded: CatalogItem[]) {
  const productId = useSearchParams().get(PARAM);
  const knownProduct = loaded.find((item) => item.product.id === productId)?.product ?? null;
  // Closing goes back only over an entry we pushed; a shared link replaces instead.
  const pushedRef = useRef(false);
  // No Radix trigger opens the dialog, so focus return is manual.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!productId) pushedRef.current = false;
  }, [productId]);

  const open = useCallback((id: string, trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    window.history.pushState(null, "", urlWith(id));
    pushedRef.current = true;
  }, []);

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", urlWith(null));
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, []);

  return { productId, knownProduct, open, close, restoreFocus };
}
