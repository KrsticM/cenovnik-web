export interface AdSize {
  width: number;
  height: number;
}

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const AD_SLOTS = {
  grid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GRID ?? "",
  detail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DETAIL ?? "",
};

export const ROWS_BETWEEN_ADS = 3;

const BANNER: AdSize = { width: 320, height: 100 };

export function gridAdSize(wide: boolean): AdSize {
  return wide ? { width: 728, height: 90 } : BANNER;
}

// On a phone the detail is full screen, so a 250px tall ad would take most of the view.
export function detailAdSize(phone: boolean): AdSize {
  return phone ? BANNER : { width: 300, height: 250 };
}

// Premium is null while unknown; ads wait for a definite "not Premium".
export function shouldShowAds(isPremium: boolean | null, client: string = ADSENSE_CLIENT): boolean {
  return isPremium === false && client !== "";
}

export type GridEntry<T> = { kind: "item"; item: T } | { kind: "ad"; index: number };

// An ad row follows every few complete rows, so it never splits a row of cards.
export function withAdRows<T>(items: T[], columns: number, enabled: boolean): GridEntry<T>[] {
  const every = columns * ROWS_BETWEEN_ADS;
  const entries: GridEntry<T>[] = [];
  items.forEach((item, i) => {
    entries.push({ kind: "item", item });
    if (enabled && (i + 1) % every === 0) entries.push({ kind: "ad", index: (i + 1) / every - 1 });
  });
  return entries;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
