import type { Item } from "@/hooks";
import type { CheckedItems } from "@/hooks/useSharedChecks";
import { formatPrice, plural } from "@/lib/formatPrice";

const articles = (n: number) => plural(n, "artikal", "artikla", "artikala");
const lineTotal = (items: Item[]) =>
  items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

export type ListSummary = {
  active: Item[];
  done: Item[];
  // False when no item has a price: every price on the page is hidden.
  showPrices: boolean;
  summaryLabel: string;
  remainingLabel: string | null;
  progress: number;
  progressLabel: string;
};

// Splits the list into to-buy and bought (newest check first) and builds the header texts.
// Items without a price are left out of the totals; a partial total says how many it covers.
export function summarizeList(items: Item[], checked: CheckedItems): ListSummary {
  const active = items.filter((item) => !checked[item.productId]);
  const done = items
    .filter((item) => checked[item.productId])
    .sort((a, b) => checked[b.productId] - checked[a.productId]);

  const n = items.length;
  const priced = items.filter((item) => item.price !== null).length;
  const showPrices = priced > 0;
  const countLabel = `${n} ${articles(n)}`;
  const totalLabel = formatPrice(lineTotal(items));

  let summaryLabel = countLabel;
  if (showPrices) {
    summaryLabel += priced === n ? ` · ${totalLabel}` : ` · ${totalLabel} (za ${priced} od ${n})`;
  }

  return {
    active,
    done,
    showPrices,
    summaryLabel,
    remainingLabel:
      showPrices && done.length > 0 && active.length > 0 ? formatPrice(lineTotal(active)) : null,
    progress: n > 0 ? done.length / n : 0,
    progressLabel: `${done.length} od ${n} kupljeno`,
  };
}
