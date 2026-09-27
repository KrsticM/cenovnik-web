import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { fetchStoresByIds } from "@/lib/services/stores";

const PRODUCTS_COLLECTION = "products";
const CURRENT_PRICES_COLLECTION = "current_prices";
const DEFAULT_PRODUCT_LIMIT = 20;
const PRICE_ROWS_PAGE = 1000;
const PRODUCTS_SELECT = "id, product_name, has_image, barcodes ( barcode )";

type ProductRow = {
  id: string;
  product_name: string;
  has_image: boolean;
  barcodes: { barcode: string }[] | null;
};

type LowestPriceRow = {
  product_id: string;
  regular_price: number;
  discounted_price: number | null;
};

type OfferPriceRow = LowestPriceRow & { store_id: string };

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    productName: row.product_name,
    hasImage: row.has_image,
    barcodes: (row.barcodes ?? []).map((b) => b.barcode),
  };
}

function randomUuid(): string {
  const hex = "0123456789abcdef";
  let value = "";
  for (let i = 0; i < 32; i++) {
    value += hex[Math.floor(Math.random() * 16)];
  }
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export async function fetchProducts(limit = DEFAULT_PRODUCT_LIMIT): Promise<Product[]> {
  const supabase = createClient();
  const seed = randomUuid();

  const { data, error } = await supabase
    .from(PRODUCTS_COLLECTION)
    .select(PRODUCTS_SELECT)
    .eq("has_image", true)
    .gte("id", seed)
    .order("id")
    .limit(limit);

  if (error) throw error;

  let rows = (data as ProductRow[] | null) ?? [];

  if (rows.length < limit) {
    const { data: wrapData, error: wrapError } = await supabase
      .from(PRODUCTS_COLLECTION)
      .select(PRODUCTS_SELECT)
      .eq("has_image", true)
      .lt("id", seed)
      .order("id")
      .limit(limit - rows.length);

    if (wrapError) throw wrapError;
    rows = [...rows, ...((wrapData as ProductRow[] | null) ?? [])];
  }

  return rows.map(mapProduct);
}

export async function searchProducts(
  searchQuery: string,
  page = 1,
): Promise<{ products: Product[]; hasMore: boolean; found: number }> {
  const supabase = createClient();
  const trimmed = searchQuery.trim();

  if (!trimmed) {
    return { products: [], hasMore: false, found: 0 };
  }

  const from = (page - 1) * DEFAULT_PRODUCT_LIMIT;
  const to = from + DEFAULT_PRODUCT_LIMIT - 1;

  const isBarcode = /^\d{6,}$/.test(trimmed);

  if (isBarcode) {
    const { data, count, error } = await supabase
      .from(PRODUCTS_COLLECTION)
      .select("id, product_name, has_image, barcodes!inner ( barcode )", {
        count: "exact",
      })
      .eq("barcodes.barcode", trimmed)
      .range(from, to);

    if (error) throw error;

    const products = ((data as ProductRow[] | null) ?? []).map(mapProduct);
    const found = count ?? 0;
    const hasMore = from + products.length < found;

    return { products, hasMore, found };
  }

  const { data, count, error } = await supabase
    .from(PRODUCTS_COLLECTION)
    .select(PRODUCTS_SELECT, { count: "exact" })
    .ilike("product_name", `%${trimmed}%`)
    .order("product_name")
    .range(from, to);

  if (error) throw error;

  const products = ((data as ProductRow[] | null) ?? []).map(mapProduct);
  const found = count ?? 0;
  const hasMore = from + products.length < found;

  return { products, hasMore, found };
}

// PostgREST filter syntax treats these as operators, and *,% as wildcards.
const FILTER_UNSAFE = /[,()*%"\\]/g;

// No count and no ORDER BY, so Postgres can stop at the limit instead of scanning every match.
// Names starting with the query (or with a word that does) rank ahead of plain substring hits.
export async function fetchSuggestionCandidates(searchQuery: string, limit: number): Promise<Product[]> {
  const term = searchQuery.trim().replace(FILTER_UNSAFE, " ").replace(/\s+/g, " ").trim();
  if (!term) return [];

  const supabase = createClient();

  if (/^\d{6,}$/.test(term)) {
    const { data, error } = await supabase
      .from(PRODUCTS_COLLECTION)
      .select("id, product_name, has_image, barcodes!inner ( barcode )")
      .eq("barcodes.barcode", term)
      .limit(limit);
    if (error) throw error;
    return ((data as ProductRow[] | null) ?? []).map(mapProduct);
  }

  const [wordStart, contains] = await Promise.all([
    supabase
      .from(PRODUCTS_COLLECTION)
      .select(PRODUCTS_SELECT)
      .or(`product_name.ilike."${term}*",product_name.ilike."* ${term}*"`)
      .limit(limit),
    supabase
      .from(PRODUCTS_COLLECTION)
      .select(PRODUCTS_SELECT)
      .ilike("product_name", `%${term}%`)
      .limit(limit),
  ]);
  if (wordStart.error) throw wordStart.error;
  if (contains.error) throw contains.error;

  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const row of [...((wordStart.data as ProductRow[] | null) ?? []), ...((contains.data as ProductRow[] | null) ?? [])]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(mapProduct(row));
  }
  return merged.slice(0, limit);
}

export type ProductOffer = {
  retailerId: string;
  retailerName: string;
  price: number;
  storeId: string;
  address: string | null;
  isDeal: boolean;
};

// PostgREST caps responses at 1000 rows and "all markets" can mean ~10k rows,
// so the first page returns the total count and the rest are fetched in parallel.
async function fetchPriceRows(productIds: string[], storeIds?: string[]): Promise<OfferPriceRow[]> {
  const supabase = createClient();

  const pageQuery = (from: number, withCount: boolean) => {
    let query = supabase
      .from(CURRENT_PRICES_COLLECTION)
      .select("product_id, regular_price, discounted_price, store_id", withCount ? { count: "exact" } : undefined)
      .in("product_id", productIds)
      .order("product_id")
      .order("store_id")
      .range(from, from + PRICE_ROWS_PAGE - 1);
    if (storeIds && storeIds.length > 0) {
      query = query.in("store_id", storeIds);
    }
    return query;
  };

  const first = await pageQuery(0, true);
  if (first.error) throw first.error;
  const rows: OfferPriceRow[] = [...((first.data as OfferPriceRow[] | null) ?? [])];

  const total = first.count ?? rows.length;
  const rest = await Promise.all(
    Array.from({ length: Math.ceil(total / PRICE_ROWS_PAGE) - 1 }, (_, i) =>
      pageQuery((i + 1) * PRICE_ROWS_PAGE, false)
    )
  );
  for (const page of rest) {
    if (page.error) throw page.error;
    rows.push(...((page.data as OfferPriceRow[] | null) ?? []));
  }
  return rows;
}

// Cheapest effective price per product; products without a price in scope are omitted.
export async function fetchLowestPrices(
  productIds: string[],
  storeIds?: string[]
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const lowest: Record<string, number> = {};
  for (const row of await fetchPriceRows(productIds, storeIds)) {
    const price = row.discounted_price ?? row.regular_price;
    if (lowest[row.product_id] === undefined || price < lowest[row.product_id]) {
      lowest[row.product_id] = price;
    }
  }
  return lowest;
}

// Every requested id gets an entry; [] means "no price in scope", so callers can tell it apart from "not fetched yet".
export async function fetchProductOffers(
  productIds: string[],
  storeIds?: string[]
): Promise<Record<string, ProductOffer[]>> {
  if (productIds.length === 0) return {};

  const rows = await fetchPriceRows(productIds, storeIds);

  // current_prices has no PostgREST FK to stores, so embedded joins fail; fetch separately.
  const stores = await fetchStoresByIds([...new Set(rows.map((r) => r.store_id))]);

  const offers: Record<string, ProductOffer[]> = Object.fromEntries(
    productIds.map((id) => [id, []])
  );
  for (const row of rows) {
    const store = stores.get(row.store_id);
    offers[row.product_id].push({
      retailerId: store?.retailerId ?? row.store_id,
      retailerName: store?.retailerName ?? "",
      price: row.discounted_price ?? row.regular_price,
      storeId: row.store_id,
      address: store?.address ?? null,
      isDeal: row.discounted_price !== null,
    });
  }

  for (const productOffers of Object.values(offers)) {
    productOffers.sort((a, b) => a.price - b.price);
  }

  return offers;
}
