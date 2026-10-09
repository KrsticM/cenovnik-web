import { plural } from "@/lib/formatPrice";
import { MIN_STORES } from "@/lib/storeLimits";
import type { Retailer, RetailerStore } from "@/lib/services/retailers";

export type StoreOptionRow = RetailerStore & { picked: boolean; blocked: boolean };

export type ChainRow = {
  id: string;
  name: string;
  subtitle: string;
  pickedCount: number;
  open: boolean;
  stores: StoreOptionRow[];
};

export type PickedChip = { id: string; label: string };

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

export function buildChainRows({ retailers, query, picked, pinned, openChains, limit }: BuildRowsInput): ChainRow[] {
  const q = normalizeSearch(query.trim());
  const full = picked.size >= limit;
  const rows: ChainRow[] = [];

  for (const retailer of retailers) {
    const matches = retailer.stores
      .filter((store) => !q || normalizeSearch(`${retailer.name} ${store.name} ${store.address ?? ""}`).includes(q))
      .sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)));
    if (q && matches.length === 0) continue;

    rows.push({
      id: retailer.id,
      name: retailer.name,
      subtitle: q
        ? `${matches.length} ${plural(matches.length, "rezultat", "rezultata", "rezultata")}`
        : `${retailer.stores.length} ${storesWord(retailer.stores.length)}`,
      pickedCount: retailer.stores.filter((store) => picked.has(store.id)).length,
      open: q ? true : openChains.has(retailer.id),
      stores: matches.map((store) => {
        const isPicked = picked.has(store.id);
        return { ...store, picked: isPicked, blocked: !isPicked && full };
      }),
    });
  }
  return rows;
}

export function buildPickedChips(retailers: Retailer[], picked: Set<string>): PickedChip[] {
  const chips: PickedChip[] = [];
  for (const retailer of retailers) {
    for (const store of retailer.stores) {
      if (!picked.has(store.id)) continue;
      const label = store.name.toLowerCase().startsWith(retailer.name.toLowerCase())
        ? store.name
        : `${retailer.name} · ${store.name}`;
      chips.push({ id: store.id, label });
    }
  }
  return chips;
}

export function saveLabel(count: number, saving: boolean): string {
  if (saving) return "Čuvamo…";
  const missing = MIN_STORES - count;
  if (missing > 0) return `Izaberi još ${missing} ${plural(missing, "market", "marketa", "marketa")}`;
  return `Sačuvaj (${count})`;
}

export function saveHint(retailers: Retailer[], picked: Set<string>): string {
  if (picked.size < MIN_STORES) return `Potrebna su bar ${MIN_STORES} ${storesWord(MIN_STORES)} da bismo mogli da uporedimo cene.`;
  const chains = retailers.filter((retailer) => retailer.stores.some((store) => picked.has(store.id))).length;
  return `${picked.size} ${storesWord(picked.size)} u ${chains} ${plural(chains, "prodavnici", "prodavnice", "prodavnica")}. Možeš ih promeniti kasnije u Mojim marketima.`;
}

export function limitText(limit: number): string {
  return `Izabrao si maksimalnih ${limit} marketa. Ukloni neki ili pređi na Premium za neograničen broj.`;
}
