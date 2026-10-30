import type { ReactNode, Ref } from "react";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DoneSectionProps {
  count: number;
  triggerRef?: Ref<HTMLButtonElement>;
  className?: string;
  triggerClassName?: string;
  children: ReactNode;
}

export function DoneSection({ count, triggerRef, className, triggerClassName, children }: DoneSectionProps) {
  return (
    <Collapsible className={cn("bg-paper-warm", className)}>
      <CollapsibleTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          className={cn("group/trigger flex h-auto min-h-14 w-full items-center justify-between gap-3 rounded-none px-card text-sm font-semibold text-ink hover:bg-transparent hover:text-ink", triggerClassName)}
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
