"use client";

import { Button } from "@/components/ui/button";

interface QtyOverlayProps {
  quantity: number;
  expanded: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onExpand: () => void;
}

const QTY_BUTTON = "text-[17px] leading-none";

// Wolt-style control: "+" → collapsed count pill → expanded − n + ×.
export function QtyOverlay({ quantity, expanded, onIncrement, onDecrement, onRemove, onExpand }: QtyOverlayProps) {
  if (quantity === 0) {
    return (
      <Button
        variant="pill"
        size="icon-md"
        onClick={onIncrement}
        aria-label="Dodaj na listu"
        className="bg-white/95 text-[19px] leading-none text-sage transition-all duration-150 hover:border-sage-dark hover:bg-sage-dark hover:text-cream"
      >
        +
      </Button>
    );
  }

  if (!expanded) {
    return (
      <Button
        variant="sage"
        onClick={onExpand}
        aria-label="Izmeni količinu"
        className="h-9 min-w-9 animate-[qtyIn_200ms_ease_both] rounded-[18px] px-3 text-[15px] font-semibold shadow-[0_4px_12px_rgba(112,132,95,0.32)] hover:bg-sage-dark"
      >
        {quantity}
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Količina"
      className="flex h-9 animate-[qtyIn_200ms_ease_both] items-center gap-0.5 rounded-[18px] bg-sage-dark px-1 shadow-[0_6px_18px_rgba(112,132,95,0.36)]"
    >
      <Button variant="on-sage" size="icon-sm" onClick={onDecrement} aria-label="Smanji" className={QTY_BUTTON}>
        −
      </Button>
      <span className="min-w-5 text-center text-sm font-semibold text-cream">{quantity}</span>
      <Button variant="on-sage" size="icon-sm" onClick={onIncrement} aria-label="Povećaj" className={QTY_BUTTON}>
        +
      </Button>
      <Button
        variant="on-sage-remove"
        size="icon-sm"
        onClick={onRemove}
        aria-label="Ukloni sa liste"
        className="ml-0.5 text-[13px] leading-none"
      >
        ×
      </Button>
    </div>
  );
}
