import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { WideQuantityStepper } from "@/components/QuantityStepper/WideQuantityStepper";
import { useProductListControl } from "../../hooks/useProductListControl";

interface DetailAddControlProps {
  product: Product;
  price?: number;
}

export function DetailAddControl({ product, price }: DetailAddControlProps) {
  const { quantity, increment, decrement } = useProductListControl(product, price);

  if (quantity === 0) {
    return (
      <Button variant="sage" size="pill-xl" onClick={increment} className="w-full">
        Dodaj u listu
      </Button>
    );
  }

  return (
    <WideQuantityStepper
      label={`${quantity} na listi`}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
}
