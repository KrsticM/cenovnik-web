export type ShoppingList = {
  id: string;
  userId: string;
  name: string;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListItemBase = {
  productId: string;
  productName: string;
  primaryBarcode: string | null;
  hasImage: boolean;
  quantity: number;
  price: number | null;
  checkedAt: string | null;
};

export type ShoppingListItem = ListItemBase & {
  id: string;
  shoppingListId: string;
  storeName?: string;
  createdAt: string;
};
