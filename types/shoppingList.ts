export type ShoppingList = {
  id: string;
  userId: string;
  name: string;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShoppingListItem = {
  id: string;
  shoppingListId: string;
  productId: string;
  productName: string;
  primaryBarcode: string | null;
  hasImage: boolean;
  quantity: number;
  price: number | null;
  storeName?: string;
  createdAt: string;
};
