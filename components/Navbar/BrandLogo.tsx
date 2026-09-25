"use client";

import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
      {/* 3-bar price comparison mark (horizontal, bottom-aligned) */}
      <div className="flex items-end gap-1">
        <div className="w-[11px] rounded-[5px] bg-[#DA864D]" style={{ height: "32px" }} />
        <div className="w-[11px] rounded-[5px] bg-[#c4bfb4]" style={{ height: "22px" }} />
        <div className="w-[11px] rounded-[5px] bg-[#70845F]" style={{ height: "13px" }} />
      </div>

      {/* Wordmark */}
      <div className="text-xl font-semibold">
        <span className="text-[#DA864D]">e</span>
        <span className="text-[#1a1a1a]">Cenovnik</span>
      </div>
    </Link>
  );
}
