import type { ReactNode, Ref } from "react";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DoneSectionProps {
  count: number;
  triggerRef?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function DoneSection({ count, triggerRef, children }: DoneSectionProps) {
  return (
    <Collapsible className="bg-paper-warm">
      <CollapsibleTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          className="group/trigger flex h-auto min-h-14 w-full items-center justify-between gap-3 rounded-none px-card text-sm font-semibold text-ink hover:bg-transparent hover:text-ink"
        >
          Kupljeno ({count})
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
