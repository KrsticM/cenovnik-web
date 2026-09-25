"use client";

import { useState } from "react";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

interface ListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListPanel({ open, onOpenChange }: ListPanelProps) {
  const { items, itemCount, clearList, updateQuantity, removeItem } = useShoppingList();

  const handleClearList = () => {
    if (window.confirm("Zaista želite da obrisete sve stavke iz liste?")) {
      clearList();
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] lg:w-[440px] p-0 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <SheetTitle>Vaša lista</SheetTitle>
        </div>

        {itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
            <h3 className="text-lg font-semibold text-foreground">
              Vaša lista je prazna.
            </h3>
            <p className="text-sm text-muted-foreground">
              Počnite da dodajete proizvode.
            </p>
            <Link href="/proizvodi" onClick={() => onOpenChange(false)}>
              <Button variant="default" size="sm">
                Pregledaj proizvode
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Items list - scrollable */}
            <div className="flex-1 overflow-y-auto space-y-3 px-6 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="line-clamp-2 text-sm font-medium text-foreground">
                      {item.productName}
                    </h4>
                    {item.price && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    )}
                  </div>

                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrement={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    onDecrement={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            {/* Footer: Total and actions - always visible */}
            <div className="border-t border-border bg-background px-6 py-4 space-y-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Ukupno:</span>
                <span className="text-[#A85B2A]">{formatPrice(total)}</span>
              </div>

              <div className="flex gap-2">
                <Link href="/proizvodi" className="flex-1">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Nastavi kupovinu
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleClearList}
                  className="flex-1"
                >
                  Isprazni
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
