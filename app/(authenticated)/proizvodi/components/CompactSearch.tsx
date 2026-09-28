"use client";

import { DOCK_EASE } from "../config";
import { SearchField } from "./SearchField";
import { SearchBindings } from "./SearchDock";

export function CompactBandSearch({ search }: { search: SearchBindings }) {
  return (
    <div className="w-full max-w-[720px] lg:hidden">
      <SearchField
        {...search}
        inputClassName="h-[54px] rounded-[31px] border-cream-border pl-11 pr-[76px] text-base shadow-[0_4px_18px_rgba(122,100,60,0.09)] transition-[border-color,box-shadow] duration-180 focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)] sm:h-[62px] sm:pl-[52px] sm:text-[17px]"
        iconClassName="left-[18px] h-[15px] w-[15px] border-ink-soft sm:left-[22px]"
        spinnerClassName="right-6 h-4 w-4 border-[#eadfc8]"
        clearClassName="right-11"
        dropdownClassName="rounded-2xl shadow-[0_18px_48px_rgba(26,26,26,0.16)]"
        rowClassName="px-[18px] py-[13px]"
        rowTextClassName="text-[15px]"
        showAllClassName="px-[18px] py-[13px]"
      />
    </div>
  );
}

// Below lg the hero field scrolls away; this strip slides out of the header to replace it.
export function CompactDockedSearch({ search, docked }: { search: SearchBindings; docked: boolean }) {
  return (
    <div
      className="fixed left-0 right-0 top-[67px] z-40 overflow-hidden border-b bg-white/95 backdrop-blur-md lg:hidden"
      style={{
        height: docked ? 68 : 0,
        borderColor: docked ? "var(--line)" : "transparent",
        overflow: docked ? "visible" : "hidden",
        transition: `height 280ms ${DOCK_EASE}`,
      }}
    >
      <div className="mx-auto max-w-[1360px] px-4 pb-3 pt-1">
        <div
          style={{
            opacity: docked ? 1 : 0,
            transform: docked ? "translateY(0)" : "translateY(-18px)",
            visibility: docked ? "visible" : "hidden",
            transition: `opacity 200ms ease, transform 280ms ${DOCK_EASE}`,
          }}
        >
          <SearchField
            {...search}
            placeholder="Pretraži proizvode..."
            tabIndex={docked ? 0 : -1}
            inputClassName="h-11 rounded-[22px] border-line pl-[42px] pr-[62px] text-base focus:shadow-[0_0_0_4px_rgba(112,132,95,0.12)]"
            iconClassName="left-4 h-[13px] w-[13px] border-ink-muted"
            spinnerClassName="right-[17px] h-3.5 w-3.5 border-line"
            clearClassName="right-[34px]"
            dropdownClassName="rounded-[14px] shadow-[0_14px_40px_rgba(26,26,26,0.16)]"
            dropdownOffset={8}
            rowClassName="px-4 py-[13px]"
            rowTextClassName="text-[15px]"
            showAllClassName="px-4 py-3.5"
          />
        </div>
      </div>
    </div>
  );
}
