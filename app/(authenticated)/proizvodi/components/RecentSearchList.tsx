import { History } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { SearchFieldStyles } from "./searchFieldStyles";

const CLEAR_RECENT = "__clear-recent__";

interface RecentSearchListProps {
  terms: string[];
  onPick: (term: string) => void;
  onClear: () => void;
  styles: Pick<SearchFieldStyles, "row" | "rowText" | "showAll">;
}

export function RecentSearchList({ terms, onPick, onClear, styles }: RecentSearchListProps) {
  return (
    <CommandGroup heading="Nedavne pretrage" className="p-0 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-muted">
      {terms.map((term) => (
        <CommandItem
          key={term}
          value={`recent:${term}`}
          onSelect={() => onPick(term)}
          className={cn(
            "min-w-0 cursor-pointer gap-3 rounded-none border-b border-line-soft text-ink data-[selected=true]:bg-paper data-[selected=true]:text-ink",
            styles.row
          )}
        >
          <History aria-hidden="true" className="!size-[15px] shrink-0 text-ink-muted" />
          <span className={cn("flex-1 truncate", styles.rowText)}>{term}</span>
        </CommandItem>
      ))}
      <CommandItem
        value={CLEAR_RECENT}
        onSelect={onClear}
        className={cn(
          "cursor-pointer rounded-none text-[13px] font-medium text-ink-muted data-[selected=true]:bg-paper data-[selected=true]:text-rust",
          styles.showAll
        )}
      >
        Obriši nedavne pretrage
      </CommandItem>
    </CommandGroup>
  );
}
