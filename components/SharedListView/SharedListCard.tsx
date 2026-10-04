import type { Item } from "@/hooks";
import type { CheckedItems } from "@/hooks/useSharedChecks";
import { Card } from "@/components/ui/card";
import { DoneSection } from "./DoneSection";
import { SharedListRow } from "./SharedListRow";
import { SharedListSummary } from "./SharedListSummary";
import { summarizeList } from "./summarizeList";

interface SharedListCardProps {
  name: string;
  items: Item[];
  checkedItems: CheckedItems;
  onToggle: (productId: string) => void;
}

// The list itself: summary, items to buy, and the collapsible "Kupljeno" section.
export function SharedListCard({ name, items, checkedItems, onToggle }: SharedListCardProps) {
  const summary = summarizeList(items, checkedItems);
  const isEmpty = items.length === 0;

  return (
    <Card role="region" aria-labelledby="list-title" className="overflow-hidden rounded-[18px] border-line bg-white shadow-none">
      <SharedListSummary
        name={name}
        summaryLabel={summary.summaryLabel}
        remainingLabel={summary.remainingLabel}
        progress={summary.progress}
        progressLabel={summary.progressLabel}
        showProgress={!isEmpty}
      />

      <div role="group" aria-label="Za kupovinu" className="border-t border-line">
        {summary.active.map((item) => (
          <SharedListRow
            key={item.productId}
            item={item}
            checked={false}
            showPrice={summary.showPrices}
            onToggle={() => onToggle(item.productId)}
          />
        ))}
        {(isEmpty || summary.active.length === 0) && (
          <div className="px-6 py-10 text-center">
            <p className="text-[17px] font-semibold text-ink">
              {isEmpty ? "Ova lista je trenutno prazna." : "Sve je kupljeno."}
            </p>
            {!isEmpty && <p className="mt-1.5 text-sm text-ink-muted">Kupljeni artikli su ispod.</p>}
          </div>
        )}
      </div>

      {summary.done.length > 0 && (
        <DoneSection>
          {summary.done.map((item) => (
            <SharedListRow
              key={item.productId}
              item={item}
              checked
              showPrice={false}
              onToggle={() => onToggle(item.productId)}
            />
          ))}
        </DoneSection>
      )}
    </Card>
  );
}
