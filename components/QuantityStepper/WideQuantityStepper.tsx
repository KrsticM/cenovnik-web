"use client";

import { Button } from "@/components/ui/button";

interface WideQuantityStepperProps {
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

const stepButton = "h-10 w-10 shrink-0 bg-cream/14 text-xl leading-none hover:bg-cream/26";

export function WideQuantityStepper({ label, onIncrement, onDecrement, disabled = false }: WideQuantityStepperProps) {
  return (
    <div role="group" aria-label="Količina" className="flex h-[52px] w-full items-center justify-between gap-3 rounded-full bg-sage-dark px-1.5">
      <Button variant="on-sage" size="icon-lg" onClick={onDecrement} disabled={disabled} aria-label="Smanji" className={stepButton}>
        −
      </Button>
      <span className="whitespace-nowrap text-base font-medium text-cream">{label}</span>
      <Button variant="on-sage" size="icon-lg" onClick={onIncrement} disabled={disabled} aria-label="Povećaj" className={stepButton}>
        +
      </Button>
    </div>
  );
}
