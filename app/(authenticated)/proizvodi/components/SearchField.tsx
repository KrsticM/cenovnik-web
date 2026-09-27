"use client";

import { CSSProperties, KeyboardEvent, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SearchSuggestion = { id: string; name: string; hint: string };

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  suggestions: SearchSuggestion[];
  searching: boolean;
  placeholder?: string;
  tabIndex?: number;
  inputClassName: string;
  inputStyle?: CSSProperties;
  iconClassName: string;
  iconStyle?: CSSProperties;
  spinnerClassName: string;
  spinnerStyle?: CSSProperties;
  clearClassName?: string;
  clearStyle?: CSSProperties;
  dropdownClassName: string;
  dropdownOffset?: number;
  rowClassName: string;
  rowTextClassName: string;
  showAllClassName: string;
}

const SHOW_ALL = "__show-all__";
// cmdk always selects its first item; this invisible first option makes that default
// "search the typed text", so Enter behaves as in the design and ↓ lands on the first suggestion.
const TYPED = "__typed__";

export function SearchField({
  value,
  onChange,
  onCommit,
  suggestions,
  searching,
  placeholder = "Pretraži proizvode, prodavnice, akcije...",
  tabIndex,
  inputClassName,
  inputStyle,
  iconClassName,
  iconStyle,
  spinnerClassName,
  spinnerStyle,
  clearClassName,
  clearStyle,
  dropdownClassName,
  dropdownOffset = 10,
  rowClassName,
  rowTextClassName,
  showAllClassName,
}: SearchFieldProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typed = value.trim();
  const showSuggestions = open && typed.length > 0 && suggestions.length > 0;

  const commit = (next: string) => {
    onCommit(next);
    setOpen(false);
  };

  const clear = () => {
    commit("");
    inputRef.current?.focus();
  };

  const commitTyped = () => {
    commit(value);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && !showSuggestions) {
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
      <Popover open={showSuggestions} onOpenChange={(next) => !next && setOpen(false)}>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className="relative flex items-center">
            <span
              aria-hidden="true"
              className={cn("absolute block rounded-full border-2", iconClassName)}
              style={iconStyle}
            />
            <CommandPrimitive.Input
              ref={inputRef}
              inputMode="search"
              enterKeyHint="search"
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
              className={cn(
                "w-full border bg-white text-ink outline-none focus:border-sage",
                inputClassName
              )}
              style={inputStyle}
            />
            {typed.length > 0 && (
              <Button
                variant="ghost-clear"
                size="icon-sm"
                onClick={clear}
                aria-label="Obriši pretragu"
                className={cn("absolute text-lg font-normal leading-none", clearClassName)}
                style={clearStyle}
              >
                ×
              </Button>
            )}
            {searching && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute block animate-[spin_700ms_linear_infinite] rounded-full border-2 border-t-sage",
                  spinnerClassName
                )}
                style={spinnerStyle}
              />
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={dropdownOffset}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Keep focus in the input while clicking a suggestion, so blur-to-close can't swallow the click.
          onMouseDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
          className={cn(
            "w-[var(--radix-popper-anchor-width)] data-[state=open]:animate-[dropIn_160ms_ease_both] overflow-hidden border-line bg-white p-0 text-ink",
            dropdownClassName
          )}
        >
          <CommandList aria-label="Predlozi pretrage" className="max-h-none">
            <CommandItem value={TYPED} onSelect={commitTyped} className="sr-only">
              Traži „{typed}“
            </CommandItem>
            {suggestions.map((s) => (
              <CommandItem
                key={s.id}
                value={s.id}
                onSelect={() => commit(s.name)}
                className={cn(
                  "min-w-0 cursor-pointer gap-3 rounded-none border-b border-[#f6f6f6] text-ink data-[selected=true]:bg-paper data-[selected=true]:text-ink",
                  rowClassName
                )}
              >
                <span
                  aria-hidden="true"
                  className="block h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[#b8b8b8]"
                />
                <span className={cn("flex-1 truncate", rowTextClassName)}>{s.name}</span>
                <span className="whitespace-nowrap text-[13px] text-ink-muted">{s.hint}</span>
              </CommandItem>
            ))}
            <CommandItem
              value={SHOW_ALL}
              onSelect={() => commit(value)}
              className={cn(
                "cursor-pointer rounded-none bg-cream text-[13px] font-semibold text-sage-dark data-[selected=true]:bg-cream data-[selected=true]:text-sage-darker",
                showAllClassName
              )}
            >
              Prikaži sve rezultate za „{typed}“
            </CommandItem>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
