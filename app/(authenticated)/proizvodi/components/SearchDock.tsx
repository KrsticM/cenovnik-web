"use client";

import { DOCK_EASE } from "../config";
import { SearchField, SearchFieldProps } from "./SearchField";

export type SearchBindings = Pick<
  SearchFieldProps,
  "value" | "onChange" | "onCommit" | "onPickSuggestion" | "suggestions" | "recent" | "onClearRecent" | "searching"
>;

interface SearchDockProps {
  search: SearchBindings;
  slotTop: number;
  docked: boolean;
  narrow: boolean;
}

export function SearchDock({ search, slotTop, docked, narrow }: SearchDockProps) {
  const width = docked ? (narrow ? 420 : 560) : narrow ? 560 : 720;

  return (
    <div
      className="left-1/2 z-[46] hidden -translate-x-1/2 lg:block"
      style={{
        position: docked ? "fixed" : "absolute",
        top: docked ? 12 : slotTop,
        width,
        transition: `width 220ms ${DOCK_EASE}`,
      }}
    >
      <SearchField {...search} variant="dock" docked={docked} />
    </div>
  );
}
