import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { withParam } from "@/lib/urlParam";

// A dialog (or any view) that lives in one query parameter, so it deep-links and works with the back button.
export function useHistoryParam(name: string) {
  const value = useSearchParams().get(name);
  // Closing goes back only over an entry we pushed; a shared link replaces instead.
  const pushedRef = useRef(false);
  // No Radix trigger opens these dialogs, so focus return is manual.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (value === null) pushedRef.current = false;
  }, [value]);

  const open = useCallback(
    (next: string, trigger?: HTMLElement | null) => {
      triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
      window.history.pushState(null, "", withParam(window.location.href, name, next));
      pushedRef.current = true;
    },
    [name]
  );

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", withParam(window.location.href, name, null));
    }
  }, [name]);

  const restoreFocus = useCallback(() => {
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, []);

  return { value, open, close, restoreFocus };
}
