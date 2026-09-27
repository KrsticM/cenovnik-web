import { useShoppingList } from "@/contexts/ShoppingListContext";

export function useProductListControl(productId: string) {
  const { getItemByProductId, addItem, updateQuantity, removeItem } =
    useShoppingList();

  const item = getItemByProductId?.(productId);
  const quantity = item?.quantity ?? 0;

  const increment = async () => {
    try {
      await addItem(productId, (quantity || 0) + 1);
    } catch (err) {
      console.error("Failed to increment quantity:", err);
    }
  };

  const decrement = async () => {
    if (quantity && quantity > 1 && item?.id) {
      try {
        await updateQuantity(item.id, quantity - 1);
      } catch (err) {
        console.error("Failed to decrement quantity:", err);
      }
    } else if (quantity === 1 && item?.id) {
      try {
        await removeItem(item.id);
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    }
  };

  const remove = async () => {
    if (item?.id) {
      try {
        await removeItem(item.id);
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    }
  };

  return {
    quantity,
    increment,
    decrement,
    remove,
  };
}
