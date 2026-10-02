import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const PARAM = "proizvod";

function urlWith(productId: string | null): string {
  const url = new URL(window.location.href);
  if (productId) url.searchParams.set(PARAM, productId);
  else url.searchParams.delete(PARAM);
  return url.toString();
}

// The open product lives in the URL (?proizvod=<id>), so a detail is shareable and Back closes it.
// Uses the History API like useProductSearch; Next keeps useSearchParams in sync with it.
export function useProductDetailParam() {
  const productId = useSearchParams().get(PARAM);
  // True when we pushed the entry, so closing can go back instead of leaving a duplicate entry.
  const pushedRef = useRef(false);
  // The dialog isn't opened by a Radix trigger, so remember where focus should go back to.
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

  return { productId, open, close, restoreFocus };
}
