import { useShoppingList } from "@/contexts/ShoppingListContext";
import type { Product } from "@/types/product";

// Quantity of one product on the active list, plus +/−/remove. Changes show immediately;
// the context saves them in order and surfaces errors.
export function useProductListControl(product: Product, price: number | null) {
  const { getItemByProductId, setQuantity, removeItem } = useShoppingList();
  const quantity = getItemByProductId(product.id)?.quantity ?? 0;

  const increment = () =>
    setQuantity(product.id, quantity + 1, {
      productName: product.productName,
      primaryBarcode: product.barcodes[0] ?? null,
      hasImage: product.hasImage,
      price,
    });

  return {
    quantity,
    increment,
    decrement: () => setQuantity(product.id, quantity - 1),
    remove: () => removeItem(product.id),
  };
}
