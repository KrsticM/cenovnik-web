"use client";

import { useEffect, useRef, useState } from "react";
import type { ShoppingListItem } from "@/types/shoppingList";
import { EmptyState } from "@/components/ui/empty-state";
import { BoughtItems } from "./BoughtItems";
import { ListPanelRow } from "./ListPanelRow";

interface ListItemsProps {
  active: ShoppingListItem[];
  bought: ShoppingListItem[];
  onCheck: (productId: string, checked: boolean) => void;
  onQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

type FocusTarget = { productId: string } | "done-trigger";

export function ListItems({ active, bought, onCheck, onQuantity, onRemove }: ListItemsProps) {
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const doneTriggerRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // A ticked row unmounts, so focus moves to the next row to buy (or to "Kupljeno"), like the shared list.
  const toggle = (item: ShoppingListItem, toBought: boolean) => {
    if (document.activeElement === rowRefs.current.get(item.productId)) {
      if (!toBought) {
        focusTarget.current = { productId: item.productId };
      } else {
        const index = active.indexOf(item);
        const next = active[index + 1] ?? active[index - 1];
        focusTarget.current = next ? { productId: next.productId } : "done-trigger";
      }
    }
    setAnnouncement(`${item.productName} ${toBought ? "označeno kao kupljeno" : "vraćeno na listu"}`);
    onCheck(item.productId, toBought);
  };

  useEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    focusTarget.current = null;
    const element = target === "done-trigger" ? doneTriggerRef.current : rowRefs.current.get(target.productId);
    element?.focus();
  }, [active, bought]);

  const rowRef = (productId: string) => (element: HTMLButtonElement | null) => {
    if (element) rowRefs.current.set(productId, element);
    else rowRefs.current.delete(productId);
  };

  return (
    <div className="px-5 py-2">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {active.map((item) => (
        <ListPanelRow
          key={item.id}
          item={item}
          tickRef={rowRef(item.productId)}
          onCheck={() => toggle(item, true)}
          onIncrement={() => onQuantity(item.productId, item.quantity + 1)}
          onDecrement={() => onQuantity(item.productId, item.quantity - 1)}
          onRemove={() => onRemove(item.productId)}
        />
      ))}
      {active.length === 0 && (
        <EmptyState size="md" title="Kupljeni artikli su ispod." className="px-2 py-8" titleClassName="font-semibold" />
      )}
      {bought.length > 0 && (
        <BoughtItems items={bought} rowRef={rowRef} triggerRef={doneTriggerRef} onUncheck={(item) => toggle(item, false)} />
      )}
    </div>
  );
}
