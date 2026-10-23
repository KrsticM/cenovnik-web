"use client";

import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListBadgeProps {
  landing: boolean;
  onClick?: () => void;
}

export function ListBadge({ landing, onClick }: ListBadgeProps) {
  const { itemCount } = useShoppingList();

  return (
    <Button
      variant="pill"
      onClick={onClick}
      aria-label="Otvori listu za kupovinu"
      className={cn(
        "h-11 gap-2.5 rounded-[22px] px-2 text-[15px] [transition:border-color_180ms_ease,scale_480ms_cubic-bezier(0.34,1.56,0.64,1)] lg:pl-4 lg:pr-2",
        landing && "scale-[1.12]"
      )}
    >
      <span className="hidden whitespace-nowrap lg:inline">Lista</span>
      <Badge variant="count">{itemCount > 99 ? "99+" : itemCount}</Badge>
    </Button>
  );
}
