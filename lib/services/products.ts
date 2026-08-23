import { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";

const PRODUCTS_COLLECTION = "products";
const CURRENT_PRICES_COLLECTION = "current_prices";
const DEFAULT_PRODUCT_LIMIT = 20;
const PRODUCTS_SELECT = "id, product_name, has_image, barcodes ( barcode )";
const CURRENT_PRICES_SELECT = "product_id, regular_price, discounted_price";

type ProductRow = {
  id: string;
  product_name: string;
  has_image: boolean;
  barcodes: { barcode: string }[] | null;
};

type CurrentPriceRow = {
  product_id: string;
  regular_price: number;
  discounted_price: number | null;
};

type LowestPriceRow = {
  product_id: string;
  regular_price: number;
  discounted_price: number | null;
};

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

export async function fetchLowestPrices(
  productIds: string[],
  storeIds?: string[],
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};

  const supabase = createClient();

  let query = supabase
    .from(CURRENT_PRICES_COLLECTION)
    .select("product_id, regular_price, discounted_price")
    .in("product_id", productIds);

  if (storeIds && storeIds.length > 0) {
    query = query.in("store_id", storeIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error details:", {
      message: error.message,
      code: error.code,
      status: (error as any).status,
      hint: (error as any).hint,
      details: (error as any).details,
    });
    throw error;
  }

  const lowest: Record<string, number> = {};
  for (const row of (data as LowestPriceRow[] | null) ?? []) {
    const effective = row.discounted_price ?? row.regular_price;
    const current = lowest[row.product_id];
    if (current === undefined || effective < current) {
      lowest[row.product_id] = effective;
    }
  }
  return lowest;
}
