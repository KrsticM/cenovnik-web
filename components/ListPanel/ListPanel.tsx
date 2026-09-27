"use client";

import { useState } from "react";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice, plural } from "@/lib/formatPrice";
import { getProductImageUrl } from "@/lib/productImageUrl";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingListItem } from "@/types/shoppingList";
import { ListCompare } from "./ListCompare";
import { ShareIcon, ShareListDialog } from "./ShareListDialog";
import { ClearListDialog } from "./ClearListDialog";
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
  const { list, items, total, storeIds, clearList, updateQuantity, removeItem, setSharing } =
    useShoppingList();
  const [tab, setTab] = useState<Tab>("items");
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const comparison = useListComparison(items, storeIds, open && tab === "compare");

  const hasItems = items.length > 0;
  const listName = list?.name ?? "Vaša lista";
  const close = () => onOpenChange(false);

  const setQuantity = (item: ShoppingListItem, quantity: number) => {
    if (quantity <= 0) removeItem(item.id);
    else updateQuantity(item.id, quantity);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        onInteractOutside={(e) => {
          // The undo toast lives outside the sheet; using it must not dismiss the panel.
          if ((e.target as HTMLElement | null)?.closest("[data-removal-toast]")) e.preventDefault();
        }}
        overlayClassName="bg-[rgba(26,26,26,0.28)] data-[state=open]:animate-[fadeIn_200ms_ease_both]"
        className="w-full max-w-full data-[state=open]:animate-[panelIn_260ms_cubic-bezier(0.22,1,0.36,1)_both] border-0 bg-white p-0 shadow-[-20px_0_60px_rgba(26,26,26,0.18)] sm:w-[420px] sm:max-w-full lg:w-[440px]"
      >
        <div className="border-b border-line px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-xl font-semibold tracking-[-0.02em] text-ink">
                Vaša lista
              </SheetTitle>
              <SheetDescription className="sr-only">Proizvodi na vašoj listi za kupovinu</SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-2xl border border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-ink">
                  {listName}
                </span>
                {list?.shareToken && (
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-sage-tint px-2.5 py-1 text-xs font-semibold text-sage-dark">
                    <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
                    Javna
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="pill"
                size="icon-lg"
                onClick={() => setShareOpen(true)}
                aria-label="Podeli listu"
                className="shrink-0 text-sage-dark [&_svg]:size-[18px]"
              >
                <ShareIcon size={18} />
              </Button>
              <SheetClose asChild>
                <Button
                  variant="pill"
                  size="icon-lg"
                  aria-label="Zatvori"
                  className="shrink-0 text-base font-normal text-ink-muted hover:text-sage-dark"
                >
                  ×
                </Button>
              </SheetClose>
            </div>
          </div>
        </div>

        {hasItems ? (
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as Tab)}
            className="flex min-h-0 flex-1 flex-col"
          >
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

            <TabsContent value="items" className="mt-0 flex-1 overflow-y-auto px-5 py-2">
              {items.map((item) => (
                <ListPanelRow
                  key={item.id}
                  item={item}
                  onIncrement={() => setQuantity(item, item.quantity + 1)}
                  onDecrement={() => setQuantity(item, item.quantity - 1)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </TabsContent>
            <TabsContent value="compare" className="mt-0 flex-1 overflow-y-auto px-5 py-2">
              <ListCompare
                comparison={comparison}
                loading={comparison.loading}
                itemCount={items.length}
                listTotal={total}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <div className="px-4 py-[72px] text-center">
              <span aria-hidden="true" className="inline-block h-14 w-14 rounded-2xl bg-cream" />
              <p className="mt-[18px] text-base font-medium text-ink">Vaša lista je prazna.</p>
              <p className="mt-1.5 text-sm text-ink-muted">Počnite da dodajete proizvode.</p>
              <Button variant="sage" onClick={close} className="mt-5 h-auto rounded-[22px] px-5 py-[11px]">
                Pregledaj proizvode
              </Button>
            </div>
          </div>
        )}

        <div className="border-t border-line bg-white px-5 pb-[22px] pt-[18px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-muted">
              Ukupno · {items.length} {plural(items.length, "artikal", "artikla", "artikala")}
            </span>
            <span className="text-2xl font-semibold tracking-[-0.02em] text-ink">
              {formatPrice(total)}
            </span>
          </div>
          <div className="mt-4 flex gap-2.5">
            <Button variant="sage" size="pill-lg" onClick={close} className="flex-1">
              Nastavi kupovinu
            </Button>
            <Button variant="pill-muted" size="pill-lg" onClick={() => hasItems && setConfirmOpen(true)}>
              Isprazni
            </Button>
          </div>
        </div>

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

interface ListPanelRowProps {
  item: ShoppingListItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function ListPanelRow({ item, onIncrement, onDecrement, onRemove }: ListPanelRowProps) {
  const showImage = item.hasImage && item.primaryBarcode;
  const available = item.price !== null;

  return (
    <div className="grid grid-cols-[56px_1fr_auto] items-start gap-3.5 border-b border-line-soft py-4">
      <span className={cn("block h-14 overflow-hidden rounded-[10px]", showImage ? "bg-white" : "stripes")}>
        {showImage && (
          <img
            src={getProductImageUrl(item.primaryBarcode!, "thumb")}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </span>

      <span className="block min-w-0">
        <span className="block text-sm font-medium leading-[1.3] text-ink">{item.productName}</span>
        {available && item.quantity > 1 && (
          <span className="mt-1 block text-xs text-ink-muted">
            {item.quantity} × {formatPrice(item.price)}
          </span>
        )}
        {!available && (
          <span className="mt-1 block text-xs font-medium text-rust">
            Nije dostupno u vašim marketima
          </span>
        )}
        <span className="mt-2.5 block">
          <QuantityStepper
            variant="soft"
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </span>
      </span>

      <span className="block text-right">
        <span className="block whitespace-nowrap text-[15px] font-semibold text-rust">
          {available ? formatPrice(item.price! * item.quantity) : "—"}
        </span>
        <Button
          variant="ghost-muted"
          onClick={onRemove}
          aria-label={`Ukloni ${item.productName}`}
          className="mt-2.5 h-auto rounded-[8px] px-2 py-1.5 text-xs"
        >
          Ukloni
        </Button>
      </span>
    </div>
  );
}
