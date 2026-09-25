"use client";

import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListBadgeProps {
  onClick?: () => void;
}

export function ListBadge({ onClick }: ListBadgeProps) {
  const { itemCount } = useShoppingList();

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className={cn(
        "relative h-11 w-11 rounded-full border-[#e0e0e0]",
        "hover:bg-[#FFEDD0] hover:text-[#4f5c42] transition-colors"
      )}
      aria-label="Otvori listu za kupovinu"
    >
      <ShoppingCart className="h-5 w-5" />

      {/* Count badge */}
      {itemCount > 0 && (
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#4f5c42] text-xs font-semibold text-[#FFEDD0]">
          {itemCount > 99 ? "99+" : itemCount}
        </div>
      )}
    </Button>
  );
}
