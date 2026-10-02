import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Bought items, collapsed by default so the to-buy list stays in focus.
export function DoneSection({ children }: { children: ReactNode }) {
  return (
    <Collapsible className="bg-paper-warm">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group/trigger flex h-auto min-h-14 w-full items-center justify-between gap-3 rounded-none px-[clamp(20px,4vw,28px)] text-sm font-semibold text-ink hover:bg-transparent hover:text-ink"
        >
          Kupljeno
          <Chevron size="md" className="text-ink-muted" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <div role="group" aria-label="Kupljeno" className="data-[state=open]:animate-[dropIn_160ms_ease_both]">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
