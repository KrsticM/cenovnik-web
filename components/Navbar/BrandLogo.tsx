"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BrandLogo() {
  return (
    <Button asChild variant="ghost" size="text" className="shrink-0 gap-2.5 hover:bg-transparent">
      <Link href="/" aria-label="eCenovnik, početna">
      {/* 3-bar price comparison mark (horizontal, bottom-aligned) */}
      <div aria-hidden="true" className="flex h-8 items-end gap-1">
        <div className="w-[11px] rounded-[5px] bg-terracotta" style={{ height: "32px" }} />
        <div className="w-[11px] rounded-[5px] bg-[#c4bfb4]" style={{ height: "22px" }} />
        <div className="w-[11px] rounded-[5px] bg-sage" style={{ height: "13px" }} />
      </div>

      {/* Wordmark */}
      <div className="whitespace-nowrap text-lg font-semibold tracking-[-0.025em]">
        <span className="text-terracotta">e</span>
        <span className="text-ink">Cenovnik</span>
      </div>
      </Link>
    </Button>
  );
}
