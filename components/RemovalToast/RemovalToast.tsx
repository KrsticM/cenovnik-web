"use client";

import { CSSProperties, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { UNDO_WINDOW_MS, useShoppingList } from "@/contexts/ShoppingListContext";

const TOAST_ID = "removal";
const TOAST_OFFSET = "max(16px, env(safe-area-inset-bottom))";

// The pill shrinks to fit and stays centred; a long name wraps to two lines instead of pushing it off a phone.
const TOASTER_STYLE = { "--width": "min(480px, calc(100vw - 32px))" } as CSSProperties;

export function RemovalToast() {
  const { lastRemoved, undoRemove } = useShoppingList();
  const undoRef = useRef(undoRemove);
  useEffect(() => {
    undoRef.current = undoRemove;
  });

  useEffect(() => {
    if (!lastRemoved) {
      toast.dismiss(TOAST_ID);
      return;
    }
    toast.custom(
      (id) => (
        <div
          data-removal-toast
          className="pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 rounded-[14px] bg-ink py-3 pl-[18px] pr-3 text-white shadow-[0_16px_40px_rgba(26,26,26,0.28)]"
        >
          <span className="line-clamp-2 min-w-0 text-sm leading-[1.4] wrap-anywhere">Uklonjeno: {lastRemoved.productName}</span>
          <Button
            variant="cream"
            onClick={() => {
              toast.dismiss(id);
              undoRef.current();
            }}
            className="h-[34px] shrink-0 rounded-[17px] px-3.5"
          >
            Vrati
          </Button>
        </div>
      ),
      { id: TOAST_ID, duration: UNDO_WINDOW_MS }
    );
  }, [lastRemoved]);

  return (
    <Toaster
      position="bottom-center"
      offset={TOAST_OFFSET}
      mobileOffset={TOAST_OFFSET}
      style={TOASTER_STYLE}
      toastOptions={{
        unstyled: true,
        // Sonner's row shrinks to content at the toaster's left edge; stretch it so the pill centres.
        className: "pointer-events-none flex w-[var(--width)] justify-center",
      }}
    />
  );
}
