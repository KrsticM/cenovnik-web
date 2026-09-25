"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
  disabled = false,
  size = "md",
  showRemove = false,
}: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-[#4f5c42] text-white",
        size === "sm" ? "px-2 py-1" : "px-3 py-2"
      )}
    >
      <button
        onClick={onDecrement}
        disabled={disabled}
        className={cn(
          buttonSize,
          "inline-flex items-center justify-center rounded-full hover:bg-[#3f4a35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Decrease quantity"
      >
        <Minus size={size === "sm" ? 14 : 16} />
      </button>

      <span className={cn("min-w-[2rem] text-center font-semibold", textSize)}>
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        disabled={disabled}
        className={cn(
          buttonSize,
          "inline-flex items-center justify-center rounded-full hover:bg-[#3f4a35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Increase quantity"
      >
        <Plus size={size === "sm" ? 14 : 16} />
      </button>

      {showRemove && onRemove && (
        <>
          <div className="w-px h-6 bg-white/20" />
          <button
            onClick={onRemove}
            disabled={disabled}
            className={cn(
              buttonSize,
              "inline-flex items-center justify-center rounded-full hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Remove item"
          >
            <Trash2 size={size === "sm" ? 14 : 16} />
          </button>
        </>
      )}
    </div>
  );
}
