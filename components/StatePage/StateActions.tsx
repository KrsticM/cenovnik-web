import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";

// The design's one primary pill per screen (48 px, sage-dark).
export function PrimaryAction(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button variant="sage" className="h-12 min-w-[180px] rounded-full px-6 text-[15px]" {...props} />;
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="sage" className="h-12 rounded-full px-6 text-[15px]">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

// Secondary text link, 44 px tall for touch.
export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="underline" size="text" className="h-11 px-3 text-sm font-medium underline-offset-[3px]">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
