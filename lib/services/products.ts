import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { fetchStoresByIds, type Store } from "@/lib/services/stores";

const CURRENT_PRICES_COLLECTION = "current_prices";
const PRICE_ROWS_PAGE = 1000;

type LowestPriceRow = {
  product_id: string;
  regular_price: number;
  discounted_price: number | null;
};

type OfferPriceRow = LowestPriceRow & { store_id: string };

// ---- Catalog browse/search (Postgres functions in supabase/browse_products.sql) ----------------

export type BrowseSort = "relevance" | "price_asc" | "price_desc" | "name";

export type BrowseFilters = {
  query?: string;
  // null = all markets; otherwise the user's store ids ("Samo moji marketi").
  storeIds: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
  dealsOnly?: boolean;
};

export type BrowseCursor = { num: number; text: string; id: string };

export type CatalogItem = { product: Product; price: number; regularPrice: number; isDeal: boolean };

type BrowseRow = {
  id: string;
  product_name: string;
  has_image: boolean;
  barcodes: string[] | null;
  min_price: number;
  regular_price: number;
  is_deal: boolean;
  sort_num: number;
  sort_text: string;
};

// Above this the count is capped; the UI shows "1.000+".
export const COUNT_CAP = 1000;

function filterParams(filters: BrowseFilters) {
  return {
    p_query: filters.query?.trim() || null,
    p_store_ids: filters.storeIds && filters.storeIds.length > 0 ? filters.storeIds : null,
    p_price_min: filters.priceMin ?? null,
    p_price_max: filters.priceMax ?? null,
    p_deals_only: filters.dealsOnly ?? false,
  };
}

// One page of products with the cheapest price in scope, filtered and sorted in the database.
// Pass the returned cursor to get the next page (keyset pagination, no OFFSET).
export async function browseProducts(
  filters: BrowseFilters,
  options: { sort: BrowseSort; seed: string; limit: number; after?: BrowseCursor | null }
): Promise<{ items: CatalogItem[]; nextCursor: BrowseCursor | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("browse_products", {
    ...filterParams(filters),
    p_sort: options.sort,
    p_seed: options.seed,
    p_limit: options.limit,
    p_after_num: options.after?.num ?? null,
    p_after_text: options.after?.text ?? null,
    p_after_id: options.after?.id ?? null,
  });
  if (error) throw error;

  const rows = (data as BrowseRow[] | null) ?? [];
  const items = rows.map((row) => ({
    product: {
      id: row.id,
      productName: row.product_name,
      hasImage: row.has_image,
      barcodes: row.barcodes ?? [],
    },
    price: Number(row.min_price),
    regularPrice: Number(row.regular_price),
    isDeal: row.is_deal,
  }));
  const last = rows[rows.length - 1];
  const nextCursor =
    rows.length === options.limit && last
      ? { num: Number(last.sort_num), text: last.sort_text, id: last.id }
      : null;

  return { items, nextCursor };
}

// Number of matching products, exact up to COUNT_CAP; anything above returns COUNT_CAP + 1.
export async function countProducts(filters: BrowseFilters): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("browse_products_count", filterParams(filters));
  if (error) throw error;
  return (data as number | null) ?? 0;
}

// ---- Per-store offers (list panel pricing and market comparison) -----------------------------

export type ProductOffer = {
  retailerId: string;
  retailerName: string;
  price: number;
  regularPrice: number;
  storeId: string;
  address: string | null;
  isDeal: boolean;
};

// Pages through one price query until a short page; PostgREST caps each response at 1000 rows.
async function fetchPriceRowsPaged(productIds: string[], storeIds?: string[]): Promise<OfferPriceRow[]> {
  const supabase = createClient();
  const rows: OfferPriceRow[] = [];

  for (let from = 0; ; from += PRICE_ROWS_PAGE) {
    let query = supabase
      .from(CURRENT_PRICES_COLLECTION)
      .select("product_id, regular_price, discounted_price, store_id")
      .in("product_id", productIds)
      .order("product_id")
      .order("store_id")
      .range(from, from + PRICE_ROWS_PAGE - 1);
    if (storeIds && storeIds.length > 0) {
      query = query.in("store_id", storeIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    const page = (data as OfferPriceRow[] | null) ?? [];
    rows.push(...page);
    if (page.length < PRICE_ROWS_PAGE) return rows;
  }
}

// Scoped to the user's stores the result is small, so one query suffices. "All markets" can be
// ~10k rows per 20 products: an exact count plus deep OFFSET pages over that set hit the statement
// timeout (57014), so fetch per product instead — each is a small index-backed read.
async function fetchPriceRows(productIds: string[], storeIds?: string[]): Promise<OfferPriceRow[]> {
  if (storeIds && storeIds.length > 0) {
    return fetchPriceRowsPaged(productIds, storeIds);
  }
  const perProduct = await Promise.all(productIds.map((id) => fetchPriceRowsPaged([id])));
  return perProduct.flat();
}

// Every requested id gets an entry; [] means "no price in scope", so callers can tell it apart from
// "not fetched yet". `stores` covers the whole scope (or every store with an offer when unscoped).
export async function fetchProductOffers(
  productIds: string[],
  storeIds?: string[]
): Promise<{ offers: Record<string, ProductOffer[]>; stores: Map<string, Store> }> {
  if (productIds.length === 0) return { offers: {}, stores: new Map() };

  const rows = await fetchPriceRows(productIds, storeIds);

  // current_prices has no PostgREST FK to stores, so embedded joins fail; fetch separately.
  const stores = await fetchStoresByIds(
    storeIds && storeIds.length > 0 ? storeIds : [...new Set(rows.map((r) => r.store_id))]
  );

  const offers: Record<string, ProductOffer[]> = Object.fromEntries(
    productIds.map((id) => [id, []])
  );
  for (const row of rows) {
    const store = stores.get(row.store_id);
    offers[row.product_id].push({
      retailerId: store?.retailerId ?? row.store_id,
      retailerName: store?.retailerName ?? "",
      price: row.discounted_price ?? row.regular_price,
      regularPrice: row.regular_price,
      storeId: row.store_id,
      address: store?.address ?? null,
      isDeal: row.discounted_price !== null,
    });
  }

  for (const productOffers of Object.values(offers)) {
    productOffers.sort((a, b) => a.price - b.price);
  }

  return { offers, stores };
}


type ProductRow = {
  id: string;
  product_name: string;
  has_image: boolean;
  barcodes: { barcode: string }[] | null;
};

export async function fetchProduct(productId: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, has_image, barcodes(barcode)")
    .eq("id", productId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProductRow;
  return {
    id: row.id,
    productName: row.product_name,
    hasImage: row.has_image,
    barcodes: (row.barcodes ?? []).map((b) => b.barcode).sort(),
  };
}
