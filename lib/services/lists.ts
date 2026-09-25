import { ShoppingList, ShoppingListItem } from "@/types/shoppingList";
import { createClient } from "@/lib/supabase/client";

const SHOPPING_LISTS_TABLE = "shopping_lists";
const SHOPPING_LIST_ITEMS_TABLE = "shopping_list_items";

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
        barcodes (barcode)
      )
    `
    )
    .eq("shopping_list_id", listId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    shoppingListId: item.shopping_list_id,
    productId: item.product_id,
    productName: item.products?.product_name || "Unknown",
    primaryBarcode: item.products?.barcodes?.[0]?.barcode || null,
    quantity: item.quantity,
    price: null, // Will be fetched separately if needed
    createdAt: item.created_at,
  }));
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
        barcodes (barcode)
      )
    `
    )
    .single();

  if (error) throw error;

  return {
    id: data.id,
    shoppingListId: data.shopping_list_id,
    productId: data.product_id,
    productName: data.products?.product_name || "Unknown",
    primaryBarcode: data.products?.barcodes?.[0]?.barcode || null,
    quantity: data.quantity,
    price: null,
    createdAt: data.created_at,
  };
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
