// Server-side only (route handler and server page). Reads a public shared list (/lista/[token])
// with the anon key: list, items and photos through the grants in supabase/public_shopping_lists.sql,
// prices from the public cheapest-price view.

export type SharedListItem = {
  productId: string;
  productName: string;
  primaryBarcode: string;
  hasImage: boolean;
  quantity: number;
  // Cheapest current price across all markets; null when no market has it.
  price: number | null;
  // When someone ticked it as bought (shared by everyone with the link); null = not bought.
  checkedAt: string | null;
};

export type SharedList = { id: string; name: string; items: SharedListItem[] };

export type SharedListResult =
  | { status: "ok"; list: SharedList }
  | { status: "not-found" }
  | { status: "error"; message: string };

type SupabaseItem = {
  product_id: string;
  quantity: number;
  checked_at?: string | null;
  products: { product_name: string; has_image: boolean; barcodes: { barcode: string }[] | null } | null;
};
type SupabasePrice = { product_id: string; min_price: number };

function config() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, headers: { apikey: key, Authorization: `Bearer ${key}` } } : null;
}

// Prices are optional on the page, so a failure here only hides them.
async function fetchPrices(url: string, headers: Record<string, string>, productIds: string[]) {
  if (productIds.length === 0) return new Map<string, number>();
  const response = await fetch(
    `${url}/rest/v1/product_price_summary?select=product_id,min_price&product_id=in.(${productIds.join(",")})`,
    { headers, cache: "no-store" },
  );
  if (!response.ok) {
    console.error("[sharedList] Prices unavailable:", response.status, await response.text());
    return new Map<string, number>();
  }
  const rows = (await response.json()) as SupabasePrice[];
  return new Map(rows.map((row) => [row.product_id, Number(row.min_price)]));
}

// checked_at comes from supabase/shared_list_checks.sql; until that runs, ticks are just absent.
async function fetchItems(url: string, headers: Record<string, string>, listId: string) {
  const query = (columns: string) =>
    fetch(
      `${url}/rest/v1/shopping_list_items?select=${columns}products(product_name,has_image,barcodes(barcode))&shopping_list_id=eq.${listId}&order=created_at.asc`,
      { headers, cache: "no-store" },
    );
  let response = await query("product_id,quantity,checked_at,");
  if (response.status === 400) response = await query("product_id,quantity,");
  return response.ok ? ((await response.json()) as SupabaseItem[]) : null;
}

// "not-found" covers both a missing list and disabled sharing, so the page never reveals which.
export async function fetchSharedList(token: string): Promise<SharedListResult> {
  const cfg = config();
  if (!cfg) return { status: "error", message: "Aplikacija nije povezana sa bazom." };
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { status: "not-found" };
  const { url, headers } = cfg;

  try {
    const listResponse = await fetch(
      `${url}/rest/v1/shopping_lists?select=id,name&share_token=eq.${encodeURIComponent(token)}&limit=1`,
      { headers, cache: "no-store" },
    );
    if (!listResponse.ok) return { status: "error", message: "Lista trenutno nije dostupna." };
    const [list] = (await listResponse.json()) as { id: string; name: string }[];
    if (!list) return { status: "not-found" };

    const rows = await fetchItems(url, headers, list.id);
    if (!rows) return { status: "error", message: "Stavke liste trenutno nisu dostupne." };
    const prices = await fetchPrices(url, headers, rows.map((row) => row.product_id));

    return {
      status: "ok",
      list: {
        id: list.id,
        name: list.name || "Lista za kupovinu",
        items: rows.map((row) => ({
          productId: row.product_id,
          productName: row.products?.product_name || "Proizvod",
          // Smallest barcode, the same one the product grid and detail use.
          primaryBarcode: (row.products?.barcodes ?? []).map((b) => b.barcode).sort()[0] || "",
          hasImage: row.products?.has_image ?? false,
          quantity: row.quantity,
          price: prices.get(row.product_id) ?? null,
          checkedAt: row.checked_at ?? null,
        })),
      },
    };
  } catch (err) {
    console.error("[sharedList] Request failed:", err);
    return { status: "error", message: "Lista trenutno nije dostupna." };
  }
}
