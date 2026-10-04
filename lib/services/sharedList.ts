
import type { ListItemBase } from "@/types/shoppingList";
import { FALLBACK_PRODUCT_NAME } from "@/lib/services/listItemRow";
import { isUuid } from "@/lib/uuid";

export type SharedListItem = ListItemBase;

export type SharedList = { id: string; name: string; topic: string | null; items: SharedListItem[] };

export type SharedListResult =
  | { status: "ok"; list: SharedList }
  | { status: "not-found" }
  | { status: "error"; message: string };

type SharedListRow = {
  id: string;
  name: string | null;
  topic?: string | null;
  items: {
    product_id: string;
    quantity: number;
    checked_at: string | null;
    product_name: string | null;
    has_image: boolean | null;
    barcode: string | null;
    min_price: number | null;
  }[];
};

const UNAVAILABLE = "Lista trenutno nije dostupna.";

function config() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, headers: { apikey: key, Authorization: `Bearer ${key}` } } : null;
}

function toSharedList(row: SharedListRow): SharedList {
  return {
    id: row.id,
    name: row.name || "Lista za kupovinu",
    topic: row.topic ?? null,
    items: row.items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name || FALLBACK_PRODUCT_NAME,
      primaryBarcode: item.barcode,
      hasImage: item.has_image ?? false,
      quantity: item.quantity,
      price: item.min_price === null ? null : Number(item.min_price),
      checkedAt: item.checked_at,
    })),
  };
}

// Queued ticks are stored per token, so one spelling keeps them together.
export function normalizeShareToken(token: string): string {
  return token.toLowerCase();
}

// "not-found" covers deleted and unshared lists alike, so the page never reveals which.
export async function fetchSharedList(token: string): Promise<SharedListResult> {
  const cfg = config();
  if (!cfg) return { status: "error", message: "Aplikacija nije povezana sa bazom." };
  if (!isUuid(token)) return { status: "not-found" };

  try {
    const response = await fetch(`${cfg.url}/rest/v1/rpc/get_shared_list`, {
      method: "POST",
      headers: { ...cfg.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: normalizeShareToken(token) }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[sharedList] get_shared_list failed:", response.status, await response.text());
      return { status: "error", message: UNAVAILABLE };
    }
    const row = (await response.json()) as SharedListRow | null;
    return row ? { status: "ok", list: toSharedList(row) } : { status: "not-found" };
  } catch (err) {
    console.error("[sharedList] Request failed:", err);
    return { status: "error", message: UNAVAILABLE };
  }
}
