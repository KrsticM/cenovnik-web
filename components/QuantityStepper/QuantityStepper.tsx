"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  showRemove?: boolean;
  variant?: "solid" | "soft" | "wide";
  // "wide" only: text between − and +, e.g. "2 na listi".
  label?: string;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
  disabled = false,
  size = "md",
  showRemove = false,
  variant = "solid",
  label,
}: QuantityStepperProps) {
  if (variant === "wide") {
    const wideButton = "h-10 w-10 shrink-0 bg-cream/14 text-xl leading-none hover:bg-cream/26";
    return (
      <div role="group" aria-label="Količina" className="flex h-[52px] w-full items-center justify-between gap-3 rounded-[26px] bg-sage-dark px-1.5">
        <Button variant="on-sage" size="icon-lg" onClick={onDecrement} disabled={disabled} aria-label="Smanji" className={wideButton}>
          −
        </Button>
        <span className="whitespace-nowrap text-base font-medium text-cream">{label ?? quantity}</span>
        <Button variant="on-sage" size="icon-lg" onClick={onIncrement} disabled={disabled} aria-label="Povećaj" className={wideButton}>
          +
        </Button>
      </div>
    );
  }

  if (variant === "soft") {
    return (
      <span className="inline-flex h-[34px] items-center gap-0.5 rounded-[17px] bg-cream px-[5px]">
        <Button variant="on-cream" size="icon-xs" onClick={onDecrement} disabled={disabled} aria-label="Smanji" className="text-base leading-none">
          −
        </Button>
        <span className="min-w-[18px] text-center text-[13px] font-semibold text-sage-dark">
          {quantity}
        </span>
        <Button variant="on-cream" size="icon-xs" onClick={onIncrement} disabled={disabled} aria-label="Povećaj" className="text-base leading-none">
          +
        </Button>
      </span>
    );
  }

  const iconSize = size === "sm" ? 14 : 16;
  const buttonClass = cn(
    "rounded-full p-0 text-white hover:bg-sage-darker hover:text-white",
    size === "sm" ? "h-8 w-8 [&_svg]:size-3.5" : "h-10 w-10"
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-sage-dark text-white",
        size === "sm" ? "px-2 py-1" : "px-3 py-2"
      )}
    >
      <Button variant="ghost" onClick={onDecrement} disabled={disabled} aria-label="Decrease quantity" className={buttonClass}>
        <Minus size={iconSize} />
      </Button>

      <span className={cn("min-w-[2rem] text-center font-semibold", size === "sm" ? "text-sm" : "text-base")}>
        {quantity}
      </span>

      <Button variant="ghost" onClick={onIncrement} disabled={disabled} aria-label="Increase quantity" className={buttonClass}>
        <Plus size={iconSize} />
      </Button>

      {showRemove && onRemove && (
        <>
          <Separator orientation="vertical" className="h-6 bg-white/20" />
          <Button
            variant="ghost"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove item"
            className={cn(buttonClass, "hover:bg-red-500")}
          >
            <Trash2 size={iconSize} />
          </Button>
        </>
      )}
    </div>
  );
}
