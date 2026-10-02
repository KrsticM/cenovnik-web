import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

// Underlined link inside running text (help footnotes).
export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="underline" size="text" className="inline text-[length:inherit] font-normal underline-offset-2">
      <a href={href}>{children}</a>
    </Button>
  );
}
