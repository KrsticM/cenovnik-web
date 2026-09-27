"use client";

import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";

interface ListBadgeProps {
  onClick?: () => void;
}

export function ListBadge({ onClick }: ListBadgeProps) {
  const { itemCount } = useShoppingList();

  return (
    <Button
      variant="pill"
      onClick={onClick}
      aria-label="Otvori listu za kupovinu"
      className="h-11 gap-2.5 rounded-[22px] px-2 text-[15px] duration-180 lg:pl-4 lg:pr-2"
    >
      <span className="hidden whitespace-nowrap lg:inline">Lista</span>
      <span className="inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-[13px] bg-sage-dark px-2 text-sm font-semibold text-cream">
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </Button>
  );
}
