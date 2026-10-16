export type SearchFieldVariant = "hero" | "dock" | "strip";

export interface SearchFieldStyles {
  input: string;
  icon: string;
  iconTone: "muted" | "soft";
  spinner: string;
  clear: string;
  dropdown: string;
  dropdownOffset: number;
  row: string;
  rowText: string;
  showAll: string;
}

const DROPDOWN_SHADOW = "rounded-2xl shadow-[0_18px_48px_rgba(26,26,26,0.16)]";

const HERO: SearchFieldStyles = {
  input:
    "h-[54px] rounded-[31px] border-cream-border pl-11 pr-[76px] text-base shadow-[0_4px_18px_rgba(122,100,60,0.09)] transition-[border-color,box-shadow] duration-180 focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)] sm:h-[62px] sm:pl-[52px] sm:text-[17px]",
  icon: "left-[18px] size-[15px] sm:left-[22px]",
  iconTone: "soft",
  spinner: "right-6 border-[#eadfc8]",
  clear: "right-11",
  dropdown: DROPDOWN_SHADOW,
  dropdownOffset: 10,
  row: "px-[18px] py-[13px]",
  rowText: "text-[15px]",
  showAll: "px-[18px] py-[13px]",
};

const STRIP: SearchFieldStyles = {
  input: "h-11 rounded-[22px] border-line pl-[42px] pr-[62px] text-base focus:shadow-[0_0_0_4px_rgba(112,132,95,0.12)]",
  icon: "left-4 size-[13px]",
  iconTone: "muted",
  spinner: "right-[17px] size-3.5",
  clear: "right-[34px]",
  dropdown: "rounded-[14px] shadow-[0_14px_40px_rgba(26,26,26,0.16)]",
  dropdownOffset: 8,
  row: "px-4 py-[13px]",
  rowText: "text-[15px]",
  showAll: "px-4 py-3.5",
};

// The desktop field grows from the hero size and docks into the header; every moving part transitions between the two.
const DOCK_EASE = "cubic-bezier(0.32,0.72,0,1)";
const DOCK_INPUT_TRANSITION = `[transition:height_220ms_${DOCK_EASE},padding_220ms_${DOCK_EASE},border-radius_220ms_ease,font-size_160ms_ease,box-shadow_220ms_ease,border-color_180ms_ease]`;
const DOCK_ICON_TRANSITION = `[transition:left_220ms_${DOCK_EASE},width_220ms_ease,height_220ms_ease]`;
const DOCK_RIGHT_TRANSITION = `[transition:right_220ms_${DOCK_EASE}]`;

function dockStyles(docked: boolean): SearchFieldStyles {
  return {
    input: docked
      ? `h-11 rounded-[22px] border-line pl-[42px] pr-[62px] text-[15px] shadow-[0_1px_3px_rgba(26,26,26,0.05)] focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)] ${DOCK_INPUT_TRANSITION}`
      : `h-[62px] rounded-[31px] border-cream-border pl-[52px] pr-[76px] text-[17px] shadow-[0_4px_18px_rgba(122,100,60,0.10)] focus:shadow-[0_0_0_4px_rgba(112,132,95,0.14)] ${DOCK_INPUT_TRANSITION}`,
    icon: `${docked ? "left-4 size-[13px]" : "left-[22px] size-[15px]"} ${DOCK_ICON_TRANSITION}`,
    iconTone: "muted",
    spinner: `${docked ? "right-4" : "right-[22px]"} size-[15px] ${DOCK_RIGHT_TRANSITION}`,
    clear: `${docked ? "right-[34px]" : "right-11"} ${DOCK_RIGHT_TRANSITION}`,
    dropdown: DROPDOWN_SHADOW,
    dropdownOffset: 10,
    row: "px-[18px] py-3",
    rowText: "text-sm",
    showAll: "px-[18px] py-[13px]",
  };
}

export function searchFieldStyles(variant: SearchFieldVariant, docked: boolean): SearchFieldStyles {
  if (variant === "dock") return dockStyles(docked);
  return variant === "strip" ? STRIP : HERO;
}
