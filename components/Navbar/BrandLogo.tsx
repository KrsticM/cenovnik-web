"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const SIZES = {
  md: { bar: "w-[11px]", heights: [32, 22, 13], gap: "h-8", text: "text-lg" },
  sm: { bar: "w-2.5", heights: [30, 20, 12], gap: "h-[30px]", text: "text-[17px]" },
};

function BrandLogo({ size = "md" }: { size?: "md" | "sm" }) {
  const s = SIZES[size];
  return (
    <Button asChild variant="ghost" size="text" className="shrink-0 gap-2.5 hover:bg-transparent">
      <Link href="/" aria-label="eCenovnik, početna">
        <span aria-hidden="true" className={`flex ${s.gap} items-end gap-1`}>
          <span className={`block ${s.bar} rounded-[5px] bg-terracotta`} style={{ height: s.heights[0] }} />
          <span className={`block ${s.bar} rounded-[5px] bg-stone`} style={{ height: s.heights[1] }} />
          <span className={`block ${s.bar} rounded-[5px] bg-sage`} style={{ height: s.heights[2] }} />
        </span>

        <span className={`whitespace-nowrap ${s.text} font-semibold tracking-[-0.025em]`}>
          <span className="text-terracotta">e</span>
          <span className="text-ink">Cenovnik</span>
        </span>
      </Link>
    </Button>
  );
}

export { BrandLogo };
