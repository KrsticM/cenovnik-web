import type { SharedListItem } from "@/lib/services/sharedList";
import type { CheckedItems } from "@/hooks/useSharedChecks";
import { articleCount, formatPrice } from "@/lib/formatPrice";

const lineTotal = (items: SharedListItem[]) =>
  items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

export type ListSummaryLabels = {
  summaryLabel: string;
  remainingLabel: string | null;
  progress: number;
  progressLabel: string;
  showProgress: boolean;
};

export type ListSummary = ListSummaryLabels & {
  active: SharedListItem[];
  done: SharedListItem[];
  showPrices: boolean;
};

export function partitionByChecked(items: SharedListItem[], checked: CheckedItems) {
  return {
    active: items.filter((item) => !checked[item.productId]),
    done: items
      .filter((item) => checked[item.productId])
      .sort((a, b) => checked[b.productId] - checked[a.productId]),
  };
}

export function summarizeList(items: SharedListItem[], checked: CheckedItems): ListSummary {
  const { active, done } = partitionByChecked(items, checked);

  const n = items.length;
  const priced = items.filter((item) => item.price !== null).length;
  const showPrices = priced > 0;
  const totalLabel = formatPrice(lineTotal(items));

  let summaryLabel = articleCount(n);
  if (showPrices) {
    summaryLabel += priced === n ? ` · ${totalLabel}` : ` · ${totalLabel} (za ${priced} od ${n})`;
  }

  return {
    active,
    done,
    showPrices,
    summaryLabel,
    remainingLabel: showPrices && done.length > 0 && active.length > 0 ? formatPrice(lineTotal(active)) : null,
    progress: n > 0 ? done.length / n : 0,
    progressLabel: `${done.length} od ${n} kupljeno`,
    showProgress: n > 0,
  };
}
