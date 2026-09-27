import { ShoppingList, ShoppingListItem } from "@/types/shoppingList";
import { createClient } from "@/lib/supabase/client";
import { fetchProductOffers } from "@/lib/services/products";

const SHOPPING_LISTS_TABLE = "shopping_lists";
const SHOPPING_LIST_ITEMS_TABLE = "shopping_list_items";

type ListItemProduct = {
  product_name: string;
  has_image: boolean;
  barcodes: { barcode: string }[] | null;
};

type ListItemRow = {
  id: string;
  shopping_list_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products: ListItemProduct | ListItemProduct[] | null;
};

function mapListItem(row: ListItemRow): ShoppingListItem {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  return {
    id: row.id,
    shoppingListId: row.shopping_list_id,
    productId: row.product_id,
    productName: product?.product_name || "Unknown",
    primaryBarcode: product?.barcodes?.[0]?.barcode || null,
    hasImage: product?.has_image ?? false,
    quantity: row.quantity,
    price: null,
    createdAt: row.created_at,
  };
}

// Same cheapest-offer source as the product cards, so list and grid prices agree.
export async function attachPrices(
  items: ShoppingListItem[],
  storeIds: string[]
): Promise<ShoppingListItem[]> {
  if (items.length === 0) return items;
  const offers = await fetchProductOffers(
    items.map((i) => i.productId),
    storeIds.length > 0 ? storeIds : undefined
  );
  return items.map((item) => {
    const best = offers[item.productId]?.[0];
    return best
      ? { ...item, price: best.price, storeName: best.retailerName }
      : item;
  });
}

export async function getOrCreateActiveList(userId: string): Promise<ShoppingList> {
  const supabase = createClient();

  // Try to get existing list for this user
  const { data: existingList, error: fetchError } = await supabase
    .from(SHOPPING_LISTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!fetchError && existingList) {
    return mapShoppingList(existingList);
  }

  // Create new list if none exists
  const { data: newList, error: createError } = await supabase
    .from(SHOPPING_LISTS_TABLE)
    .insert({
      user_id: userId,
      name: "Moja lista za kupovinu",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) throw createError;
  return mapShoppingList(newList);
}

export async function fetchListItems(listId: string): Promise<ShoppingListItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(SHOPPING_LIST_ITEMS_TABLE)
    .select(
      `
      id,
      shopping_list_id,
      product_id,
      quantity,
      created_at,
      products (
        product_name,
        has_image,
        barcodes (barcode)
      )
    `
    )
    .eq("shopping_list_id", listId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data as ListItemRow[] | null) ?? []).map(mapListItem);
}

export async function addItem(
  listId: string,
  productId: string,
  quantity: number = 1
): Promise<ShoppingListItem> {
  const supabase = createClient();

  // Upsert: insert or update if product already in list
  const { data, error } = await supabase
    .from(SHOPPING_LIST_ITEMS_TABLE)
    .upsert(
      {
        shopping_list_id: listId,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "shopping_list_id,product_id",
      }
    )
    .select(
      `
      id,
      shopping_list_id,
      product_id,
      quantity,
      created_at,
      products (
        product_name,
        has_image,
        barcodes (barcode)
      )
    `
    )
    .single();

  if (error) throw error;

  return mapListItem(data as unknown as ListItemRow);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from(SHOPPING_LIST_ITEMS_TABLE)
    .update({ quantity })
    .eq("id", itemId);

  if (error) throw error;
}

export async function removeItem(itemId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from(SHOPPING_LIST_ITEMS_TABLE)
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}

export async function clearList(listId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from(SHOPPING_LIST_ITEMS_TABLE)
    .delete()
    .eq("shopping_list_id", listId);

  if (error) throw error;
}

function mapShoppingList(row: any): ShoppingList {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    shareToken: row.share_token || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function setListShareToken(
  listId: string,
  shareToken: string | null
): Promise<ShoppingList> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(SHOPPING_LISTS_TABLE)
    .update({ share_token: shareToken, updated_at: new Date().toISOString() })
    .eq("id", listId)
    .select()
    .single();

  if (error) throw error;
  return mapShoppingList(data);
}
