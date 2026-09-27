"use client";

import { useEffect, useState } from "react";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ScrollToTopButton() {
  const { lastRemoved } = useShoppingList();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 2);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const started = Date.now();
    const focusSearchAtTop = () => {
      if (window.scrollY <= 2 || Date.now() - started > 1500) {
        const input = [
          ...document.querySelectorAll<HTMLInputElement>('input[aria-label="Pretraga proizvoda"]'),
        ].find((el) => el.offsetParent !== null && el.tabIndex !== -1);
        input?.focus({ preventScroll: true });
      } else {
        requestAnimationFrame(focusSearchAtTop);
      }
    };
    requestAnimationFrame(focusSearchAtTop);
  };

  if (!visible) return null;

  return (
    <Button
      variant="pill"
      size="icon-xl"
      onClick={scrollToTop}
      aria-label="Nazad na vrh"
      className={cn(
        "fixed right-4 z-[35] animate-[qtyIn_180ms_ease_both] shadow-[0_8px_24px_rgba(26,26,26,0.14)] transition-[bottom,border-color] duration-200 sm:right-7",
        lastRemoved ? "bottom-[88px] sm:bottom-[92px]" : "bottom-5 sm:bottom-7"
      )}
    >
      <span
        aria-hidden="true"
        className="block h-2.5 w-2.5 border-l-2 border-t-2 border-sage-dark [transform:rotate(45deg)_translate(2px,2px)]"
      />
    </Button>
  );
}
