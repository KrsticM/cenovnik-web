import { useEffect, useState } from "react";

interface UseCheckedItemsReturn {
  checkedItems: Set<string>;
  toggleItem: (productId: string) => void;
}

export function useCheckedItems(token: string): UseCheckedItemsReturn {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Restore checked items from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`ecenovnik-list:${token}`);
      if (saved) {
        setCheckedItems(new Set(JSON.parse(saved) as string[]));
      }
    } catch {
      setCheckedItems(new Set());
    }
  }, [token]);

  const toggleItem = (productId: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      window.localStorage.setItem(`ecenovnik-list:${token}`, JSON.stringify([...next]));
      return next;
    });
  };

  return { checkedItems, toggleItem };
}
