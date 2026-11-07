import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
}

// No overflow clipping: the ad must render uncropped; the rounded box only shows while it loads.
export function AdSlot({ width, height, className, children }: AdSlotProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 has-[[data-ad-status=unfilled]]:hidden", className)}
      style={{ width }}
    >
      <span className="text-[11px] leading-[1.2] text-ink-muted">Reklama</span>
      <div role="complementary" aria-label="Reklama" className="shrink-0 rounded-[12px] bg-oat" style={{ width, height }}>
        {children}
      </div>
    </div>
  );
}
