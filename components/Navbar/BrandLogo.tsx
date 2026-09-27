"use client";

import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" aria-label="eCenovnik, početna" className="flex shrink-0 items-center gap-2.5 no-underline">
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
  );
}
