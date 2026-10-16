import { plural } from "@/lib/formatPrice";
import { MIN_STORES } from "@/lib/storeLimits";
import type { Retailer, RetailerStore } from "@/lib/services/retailers";

// separated: the first store after the ones that were already picked, where "Ostale prodavnice" starts.
export type StoreOptionRow = RetailerStore & { picked: boolean; blocked: boolean; separated: boolean };

export type ChainRow = {
  id: string;
  name: string;
  subtitle: string;
  pickedCount: number;
  open: boolean;
  stores: StoreOptionRow[];
};

// "Šabac" and "sabac" match, and "đ" can be typed as "dj".
export function normalizeSearch(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj");
}

export function toggled(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

// Removing is always allowed (even above the limit); adding stops at the limit.
export function toggleStoreSelection(picked: Set<string>, storeId: string, limit: number): Set<string> {
  return picked.has(storeId) || picked.size < limit ? toggled(picked, storeId) : picked;
}

const storesWord = (n: number) => plural(n, "market", "marketa", "marketa");

interface BuildRowsInput {
  retailers: Retailer[];
  query: string;
  picked: Set<string>;
  // Picked stores as of the last open/search, so rows don't jump while the user is ticking.
  pinned: Set<string>;
  openChains: Set<string>;
  limit: number;
}

const hasPinned = (retailer: Retailer, pinned: Set<string>) => retailer.stores.some((store) => pinned.has(store.id));

function chainSubtitle(retailer: Retailer, matchCount: number, pickedCount: number, searching: boolean): string {
  if (searching) return `${matchCount} ${plural(matchCount, "rezultat", "rezultata", "rezultata")}`;
  if (pickedCount > 0) return `${pickedCount} od ${retailer.stores.length} izabrano`;
  return `${retailer.stores.length} ${storesWord(retailer.stores.length)}`;
}

export function buildChainRows({ retailers, query, picked, pinned, openChains, limit }: BuildRowsInput): ChainRow[] {
  const q = normalizeSearch(query.trim());
  const full = picked.size >= limit;
  const rows: ChainRow[] = [];

  // Chains with picked stores come first, as of the last open/search.
  const ordered = [...retailers].sort((a, b) => Number(hasPinned(b, pinned)) - Number(hasPinned(a, pinned)));

  for (const retailer of ordered) {
    const pickedCount = retailer.stores.filter((store) => picked.has(store.id)).length;
    const matches = retailer.stores
      .filter((store) => !q || normalizeSearch(`${retailer.name} ${store.name} ${store.address ?? ""}`).includes(q))
      .sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)));
    if (q && matches.length === 0) continue;

    rows.push({
      id: retailer.id,
      name: retailer.name,
      subtitle: chainSubtitle(retailer, matches.length, pickedCount, q !== ""),
      pickedCount,
      open: q ? true : openChains.has(retailer.id),
      stores: matches.map((store, index) => {
        const isPicked = picked.has(store.id);
        const separated = !q && index > 0 && !pinned.has(store.id) && pinned.has(matches[index - 1].id);
        return { ...store, picked: isPicked, blocked: !isPicked && full, separated };
      }),
    });
  }
  return rows;
}

export function isDirty(picked: Set<string>, saved: Set<string>): boolean {
  return picked.size !== saved.size || [...picked].some((id) => !saved.has(id));
}

// Unsaved picks are asked about before leaving for Premium; otherwise the dialogs just swap.
export function premiumStep(dirty: boolean): "ask" | "settings" {
  return dirty ? "ask" : "settings";
}

export function saveLabel(count: number, saving: boolean): string {
  if (saving) return "Čuvamo…";
  const missing = MIN_STORES - count;
  if (missing > 0) return `Izaberi još ${missing} ${plural(missing, "market", "marketa", "marketa")}`;
  return `Sačuvaj · ${count} ${storesWord(count)}`;
}

export function saveHint(retailers: Retailer[], picked: Set<string>): string {
  if (picked.size < MIN_STORES) return `Potrebna su bar ${MIN_STORES} ${storesWord(MIN_STORES)} da bismo mogli da uporedimo cene.`;
  const chains = retailers.filter((retailer) => retailer.stores.some((store) => picked.has(store.id))).length;
  return `${picked.size} ${storesWord(picked.size)} u ${chains} ${plural(chains, "prodavnici", "prodavnice", "prodavnica")}. Možeš ih promeniti kasnije u Mojim marketima.`;
}

export function limitText(limit: number): string {
  return `Izabrao si maksimalnih ${limit} marketa. Ukloni neki ili pređi na Premium za neograničen broj.`;
}
