import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LegalLinksProps {
  links: { label: string; href: string }[];
  // On a phone the links end the scrolling body; from `sm` they stay pinned under it.
  placement: "inline" | "pinned";
}

export function LegalLinks({ links, placement }: LegalLinksProps) {
  const inline = placement === "inline";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-x-6 border-t border-line-warm bg-ivory min-[460px]:flex-row",
        inline ? "-mx-5 px-5 pb-6 pt-2 sm:hidden" : "hidden shrink-0 px-7 py-2.5 sm:flex"
      )}
    >
      {links.map(({ label, href }) => (
        <Button key={href} asChild variant="quiet" size="link-sm" className={cn(inline && "min-h-11")}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}, otvara se na ecenovnik.app u novoj kartici`}>
            <span>{label}</span>
            <ExternalLink className="!size-3" strokeWidth={2} />
          </a>
        </Button>
      ))}
    </div>
  );
}
