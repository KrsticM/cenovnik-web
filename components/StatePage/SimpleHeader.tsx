import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "../Navbar/BrandLogo";

interface SimpleHeaderProps {
  width?: "app" | "narrow";
  children?: ReactNode;
}

export function SimpleHeader({ width = "app", children }: SimpleHeaderProps) {
  return (
    <header className="border-b border-line bg-white">
      <div
        className={cn(
          "flex h-16 items-center justify-between gap-4",
          width === "narrow" ? "container-narrow" : "mx-auto max-w-[1280px] px-4 sm:px-8"
        )}
      >
        <BrandLogo size="sm" />
        {children}
      </div>
    </header>
  );
}
