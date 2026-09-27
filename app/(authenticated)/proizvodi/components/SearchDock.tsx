"use client";

import { SearchField, SearchFieldProps } from "./SearchField";

const EASE = "cubic-bezier(0.32,0.72,0,1)";

export type SearchBindings = Pick<
  SearchFieldProps,
  "value" | "onChange" | "onCommit" | "suggestions" | "searching"
>;

interface SearchDockProps {
  search: SearchBindings;
  slotTop: number;
  docked: boolean;
  narrow: boolean;
}

export function SearchDock({ search, slotTop, docked, narrow }: SearchDockProps) {
  const width = docked ? (narrow ? 420 : 560) : narrow ? 560 : 720;
  const iconLeft = docked ? 16 : 22;

  return (
    <div
      className="left-1/2 z-[46] hidden -translate-x-1/2 lg:block"
      style={{
        position: docked ? "fixed" : "absolute",
        top: docked ? 12 : slotTop,
        width,
        transition: `width 220ms ${EASE}`,
      }}
    >
      <SearchField
        {...search}
        inputClassName={
          docked
            ? "border-line shadow-[0_1px_3px_rgba(26,26,26,0.05)] focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)]"
            : "border-cream-border shadow-[0_4px_18px_rgba(122,100,60,0.10)] focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)]"
        }
        inputStyle={{
          height: docked ? 44 : 62,
          padding: docked ? "0 62px 0 42px" : "0 76px 0 52px",
          borderRadius: docked ? 22 : 31,
          fontSize: docked ? 15 : 17,
          transition: `height 220ms ${EASE}, padding 220ms ${EASE}, border-radius 220ms ease, font-size 160ms ease, box-shadow 220ms ease, border-color 180ms ease`,
        }}
        iconClassName="border-ink-muted"
        iconStyle={{
          left: iconLeft,
          width: docked ? 13 : 15,
          height: docked ? 13 : 15,
          transition: `left 220ms ${EASE}, width 220ms ease, height 220ms ease`,
        }}
        spinnerClassName="h-[15px] w-[15px] border-line"
        spinnerStyle={{ right: iconLeft, transition: `right 220ms ${EASE}` }}
        clearStyle={{ right: docked ? 34 : 44, transition: `right 220ms ${EASE}` }}
        dropdownClassName="rounded-2xl shadow-[0_18px_48px_rgba(26,26,26,0.16)]"
        rowClassName="px-[18px] py-3"
        rowTextClassName="text-sm"
        showAllClassName="px-[18px] py-[13px]"
      />
    </div>
  );
}
