"use client";

import { useState } from "react";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClearListDialog } from "./ClearListDialog";
import { ListCompare } from "./ListCompare";
import { ListPanelFooter } from "./ListPanelFooter";
import { ListPanelHeader } from "./ListPanelHeader";
import { ListPanelRow } from "./ListPanelRow";
import { ListPanelSkeleton } from "./ListPanelSkeleton";
import { ShareListDialog } from "./ShareListDialog";
import { useListComparison } from "./useListComparison";

interface ListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = "items" | "compare";

const TABS: [Tab, string][] = [
  ["items", "Artikli"],
  ["compare", "Uporedi markete"],
];

export function ListPanel({ open, onOpenChange }: ListPanelProps) {
  const { list, items, total, storeIds, loading, clearList, setQuantity, removeItem, setSharing } =
    useShoppingList();
  const [tab, setTab] = useState<Tab>("items");
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const comparison = useListComparison(items, storeIds, open && tab === "compare");

  const hasItems = items.length > 0;
  const listName = list?.name ?? "Tvoja lista";
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        onInteractOutside={(e) => {
          // The undo toast lives outside the sheet; using it must not dismiss the panel.
          if ((e.target as HTMLElement | null)?.closest("[data-removal-toast]")) e.preventDefault();
        }}
        overlayClassName="bg-scrim-soft data-[state=open]:animate-[fadeIn_200ms_ease_both]"
        className="w-full max-w-full data-[state=open]:animate-[panelIn_260ms_cubic-bezier(0.22,1,0.36,1)_both] border-0 bg-white p-0 shadow-panel sm:w-[420px] sm:max-w-full lg:w-[440px]"
      >
        <ListPanelHeader listName={listName} isPublic={!!list?.shareToken} onShare={() => setShareOpen(true)} />

        {loading && !hasItems ? (
          <ListPanelSkeleton />
        ) : hasItems ? (
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="flex min-h-0 flex-1 flex-col">
            <div className="px-5 pt-3">
              <TabsList aria-label="Prikaz liste" className="flex h-auto w-full gap-1 rounded-[12px] bg-sand p-1">
                {TABS.map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="h-[38px] flex-1 rounded-[9px] text-sm font-medium text-ink-muted shadow-none transition-colors data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_3px_rgba(26,26,26,0.10)]"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="items" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="px-5 py-2">
                  {items.map((item) => (
                    <ListPanelRow
                      key={item.id}
                      item={item}
                      onIncrement={() => setQuantity(item.productId, item.quantity + 1)}
                      onDecrement={() => setQuantity(item.productId, item.quantity - 1)}
                      onRemove={() => removeItem(item.productId)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="compare" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="px-5 py-2">
                  <ListCompare comparison={comparison} loading={comparison.loading} itemCount={items.length} listTotal={total} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <EmptyState
              size="md"
              illustration="empty-list"
              title="Tvoja lista je prazna."
              description="Počni da dodaješ proizvode."
              action={
                <Button variant="sage" size="pill-md" onClick={close}>
                  Pregledaj proizvode
                </Button>
              }
            />
          </ScrollArea>
        )}

        <ListPanelFooter
          itemCount={items.length}
          total={total}
          onContinue={close}
          onClear={() => hasItems && setConfirmOpen(true)}
        />

        <ShareListDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          listName={listName}
          shareToken={list?.shareToken ?? null}
          onPublicChange={setSharing}
        />
        <ClearListDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          itemCount={items.length}
          listName={listName}
          onConfirm={clearList}
        />
      </SheetContent>
    </Sheet>
  );
}
