"use client";

import { DOCK_EASE } from "../config";
import { SearchField } from "./SearchField";
import { SearchBindings } from "./SearchDock";

export function CompactBandSearch({ search }: { search: SearchBindings }) {
  return (
    <div className="w-full max-w-[720px] lg:hidden">
      <SearchField {...search} />
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
          <SearchField {...search} variant="strip" placeholder="Pretraži proizvode..." tabIndex={docked ? 0 : -1} />
        </div>
      </div>
    </div>
  );
}
