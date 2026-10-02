import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import { useProductListControl } from "../../hooks/useProductListControl";

interface DetailAddControlProps {
  product: Product;
  // Cheapest price in the user's stores, stored with a newly added item; null until known.
  price: number | null;
}

// Reads its own quantity like ProductCard, so the dialog doesn't subscribe to the whole list.
export function DetailAddControl({ product, price }: DetailAddControlProps) {
  const { quantity, increment, decrement } = useProductListControl(product, price);

  if (quantity === 0) {
    return (
      <Button variant="sage" onClick={increment} className="h-[52px] w-full rounded-[26px] px-7 text-base">
        Dodaj u listu
      </Button>
    );
  }

  return (
    <QuantityStepper
      variant="wide"
      quantity={quantity}
      label={`${quantity} na listi`}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
}
