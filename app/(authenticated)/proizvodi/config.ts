export const PRODUCTS_PER_PAGE = 20;
export const GRID_CLASSES = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4";

// Easing for the search field docking into the header.
export const DOCK_EASE = "cubic-bezier(0.32,0.72,0,1)";

// Search-as-you-type starts at two letters, since one matches almost everything; Enter searches any length.
export const SEARCH_MIN_LENGTH = 2;

// The grid and the suggestions wait for the same pause in typing, so one pause costs one request each.
export const SEARCH_DEBOUNCE_MS = 350;
// The count is only a label, so it waits until typing has settled.
export const SEARCH_COUNT_DELAY_MS = 400;
