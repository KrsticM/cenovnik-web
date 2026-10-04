import { useEffect, useRef, useState } from "react";
import type { SharedListItem } from "@/lib/services/sharedList";
import type { CheckedItems } from "@/hooks/useSharedChecks";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DoneSection } from "./DoneSection";
import { SharedListRow } from "./SharedListRow";
import { SharedListSummary } from "./SharedListSummary";
import { summarizeList } from "./summarizeList";

interface SharedListCardProps {
  name: string;
  items: SharedListItem[];
  checkedItems: CheckedItems;
  onToggle: (productId: string) => void;
}

type FocusTarget = { productId: string } | "done-trigger";

export function SharedListCard({ name, items, checkedItems, onToggle }: SharedListCardProps) {
  const summary = summarizeList(items, checkedItems);
  const isEmpty = items.length === 0;

  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const doneTriggerRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // A ticked row unmounts, so move focus to the next row to buy (or to "Kupljeno").
  const toggle = (item: SharedListItem, wasChecked: boolean) => {
    if (document.activeElement === rowRefs.current.get(item.productId)) {
      if (wasChecked) {
        focusTarget.current = { productId: item.productId };
      } else {
        const index = summary.active.indexOf(item);
        const next = summary.active[index + 1] ?? summary.active[index - 1];
        focusTarget.current = next ? { productId: next.productId } : "done-trigger";
      }
    }
    setAnnouncement(`${item.productName} ${wasChecked ? "vraćeno na listu" : "označeno kao kupljeno"}`);
    onToggle(item.productId);
  };

  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    focusTarget.current = null;
    const element = target === "done-trigger" ? doneTriggerRef.current : rowRefs.current.get(target.productId);
    element?.focus();
  }, [checkedItems]);

  const rowRef = (productId: string) => (element: HTMLButtonElement | null) => {
    if (element) rowRefs.current.set(productId, element);
    else rowRefs.current.delete(productId);
  };

  return (
    <Card role="region" aria-labelledby="list-title" className="overflow-hidden rounded-[18px] border-line bg-white shadow-none">
      <SharedListSummary name={name} summary={summary} />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div role="group" aria-label="Za kupovinu" className="border-t border-line">
        {summary.active.map((item) => (
          <SharedListRow
            key={item.productId}
            ref={rowRef(item.productId)}
            item={item}
            checked={false}
            showPrice={summary.showPrices}
            onToggle={() => toggle(item, false)}
          />
        ))}
        {summary.active.length === 0 && (
          <EmptyState
            className="px-6 py-10"
            titleClassName="font-semibold"
            title={isEmpty ? "Ova lista je trenutno prazna." : "Sve je kupljeno."}
            description={isEmpty ? undefined : "Kupljeni artikli su ispod."}
          />
        )}
      </div>

      {summary.done.length > 0 && (
        <DoneSection count={summary.done.length} triggerRef={doneTriggerRef}>
          {summary.done.map((item) => (
            <SharedListRow
              key={item.productId}
              ref={rowRef(item.productId)}
              item={item}
              checked
              showPrice={false}
              onToggle={() => toggle(item, true)}
            />
          ))}
        </DoneSection>
      )}
    </Card>
  );
}
