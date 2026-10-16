import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-x-6 border-t border-line-warm bg-ivory px-5 pb-4 pt-2 min-[460px]:flex-row sm:px-7 sm:py-2.5">
      {links.map(({ label, href }) => (
        <Button
          key={href}
          asChild
          variant="quiet"
          size="link-sm"
        >
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}, otvara se na ecenovnik.app u novoj kartici`}>
            <span>{label}</span>
            <ExternalLink className="!size-3" strokeWidth={2} />
          </a>
        </Button>
      ))}
    </div>
  );
}
