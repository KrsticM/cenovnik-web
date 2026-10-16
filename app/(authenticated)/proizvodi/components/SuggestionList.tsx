import { CommandItem } from "@/components/ui/command";
import { HighlightMatch } from "@/components/ui/highlight-match";
import { RingIcon } from "@/components/ui/ring-icon";
import { cn } from "@/lib/utils";
import type { SearchFieldStyles } from "./searchFieldStyles";

export type SearchSuggestion = { id: string; name: string; hint: string };

const SHOW_ALL = "__show-all__";

interface SuggestionListProps {
  suggestions: SearchSuggestion[];
  query: string;
  onPick: (productId: string) => void;
  onShowAll: () => void;
  styles: Pick<SearchFieldStyles, "row" | "rowText" | "showAll">;
}

export function SuggestionList({ suggestions, query, onPick, onShowAll, styles }: SuggestionListProps) {
  return (
    <>
      {suggestions.map((s) => (
        <CommandItem
          key={s.id}
          value={s.id}
          onSelect={() => onPick(s.id)}
          className={cn(
            "min-w-0 cursor-pointer gap-3 rounded-none border-b border-line-soft text-ink data-[selected=true]:bg-paper data-[selected=true]:text-ink",
            styles.row
          )}
        >
          <RingIcon tone="stone" className="size-[11px] shrink-0" />
          <HighlightMatch text={s.name} query={query} className={cn("flex-1 truncate", styles.rowText)} />
          <span className="whitespace-nowrap text-[13px] text-ink-muted">{s.hint}</span>
        </CommandItem>
      ))}
      <CommandItem
        value={SHOW_ALL}
        onSelect={onShowAll}
        className={cn(
          "cursor-pointer rounded-none bg-cream text-[13px] font-semibold text-sage-dark data-[selected=true]:bg-cream data-[selected=true]:text-sage-darker",
          styles.showAll
        )}
      >
        Prikaži sve rezultate za „{query}“
      </CommandItem>
    </>
  );
}
