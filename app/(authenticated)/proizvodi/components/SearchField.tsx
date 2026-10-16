"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { RingIcon } from "@/components/ui/ring-icon";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { SEARCH_MIN_LENGTH } from "../config";
import { Button } from "@/components/ui/button";
import { RecentSearchList } from "./RecentSearchList";
import { SuggestionList, type SearchSuggestion } from "./SuggestionList";
import { searchFieldStyles, type SearchFieldVariant } from "./searchFieldStyles";

export type { SearchSuggestion };

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onPickSuggestion: (productId: string) => void;
  suggestions: SearchSuggestion[];
  recent: string[];
  onClearRecent: () => void;
  searching: boolean;
  placeholder?: string;
  tabIndex?: number;
  variant?: SearchFieldVariant;
  // Only the "dock" variant animates between its hero and docked sizes.
  docked?: boolean;
}

// cmdk always selects its first item; this invisible option makes that default "search the typed text".
const TYPED = "__typed__";

export function SearchField({
  value,
  onChange,
  onCommit,
  onPickSuggestion,
  suggestions,
  recent,
  onClearRecent,
  searching,
  placeholder = "Pretraži proizvode, prodavnice, akcije...",
  tabIndex,
  variant = "hero",
  docked = false,
}: SearchFieldProps) {
  const styles = searchFieldStyles(variant, docked);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typed = value.trim();
  const showSuggestions = open && typed.length >= SEARCH_MIN_LENGTH && suggestions.length > 0;
  // An empty, focused field offers the last searches on this device.
  const showRecent = open && typed.length === 0 && recent.length > 0;
  const listOpen = showSuggestions || showRecent;

  const commit = (next: string) => {
    onCommit(next);
    setOpen(false);
  };

  const clear = () => {
    commit("");
    inputRef.current?.focus();
  };

  const pickProduct = (productId: string) => {
    setOpen(false);
    onPickSuggestion(productId);
  };

  const commitTyped = () => {
    commit(value);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && !listOpen) {
      // With the list closed cmdk has nothing to select, so commit here.
      e.preventDefault();
      commitTyped();
    }
  };

  return (
    <Command
      shouldFilter={false}
      label="Pretraga proizvoda"
      className="relative h-auto w-full overflow-visible rounded-none bg-transparent text-ink"
    >
      <Popover open={listOpen} onOpenChange={(next) => !next && setOpen(false)}>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className="relative flex items-center">
            <RingIcon tone={styles.iconTone} className={cn("absolute", styles.icon)} />
            <CommandPrimitive.Input
              ref={inputRef}
              inputMode="search"
              enterKeyHint="search"
              // Product names, not prose: phones shouldn't "correct" or capitalise them.
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-label="Pretraga proizvoda"
              placeholder={placeholder}
              value={value}
              tabIndex={tabIndex}
              onValueChange={(next) => {
                onChange(next);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={handleKeyDown}
              className={cn("w-full border bg-white text-ink outline-none focus:border-sage", styles.input)}
            />
            {typed.length > 0 && (
              <Button
                variant="ghost-clear"
                size="icon-sm"
                onClick={clear}
                aria-label="Obriši pretragu"
                className={cn("absolute text-lg font-normal leading-none", styles.clear)}
              >
                ×
              </Button>
            )}
            {searching && <Spinner className={cn("absolute", styles.spinner)} />}
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={styles.dropdownOffset}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Keep focus in the input while clicking a suggestion, so blur-to-close can't swallow the click.
          onMouseDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className={cn(
            "w-[var(--radix-popper-anchor-width)] data-[state=open]:animate-[dropIn_160ms_ease_both] overflow-hidden border-line bg-white p-0 text-ink",
            styles.dropdown
          )}
        >
          <CommandList aria-label={showRecent ? "Nedavne pretrage" : "Predlozi pretrage"} className="max-h-none">
            <CommandItem value={TYPED} onSelect={commitTyped} className="sr-only">
              {typed ? `Traži „${typed}“` : "Prikaži sve proizvode"}
            </CommandItem>
            {showRecent ? (
              <RecentSearchList terms={recent} onPick={commit} onClear={onClearRecent} styles={styles} />
            ) : (
              <SuggestionList
                suggestions={suggestions}
                query={typed}
                onPick={pickProduct}
                onShowAll={() => commit(value)}
                styles={styles}
              />
            )}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
