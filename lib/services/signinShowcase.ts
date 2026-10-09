import { unstable_cache } from "next/cache";
import type { CatalogItem } from "@/lib/services/products";

type ShowcaseRow = {
  product_id: string;
  product_name: string;
  barcode: string | null;
  min_price: number;
  regular_price: number;
  is_deal: boolean;
};

const SHOWCASE_SIZE = 16;
// Prices change once a day (summary refresh at 08:00 UTC), so a day-old copy is still accurate enough.
const REVALIDATE_SECONDS = 60 * 60 * 24;

async function loadShowcase(): Promise<CatalogItem[]> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");

  const response = await fetch(`${url}/rest/v1/rpc/get_signin_showcase`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_limit: SHOWCASE_SIZE }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`get_signin_showcase failed: ${response.status}`);

  const rows = ((await response.json()) as ShowcaseRow[] | null) ?? [];
  return rows.map((row) => ({
    product: {
      id: row.product_id,
      productName: row.product_name,
      hasImage: row.barcode !== null,
      barcodes: row.barcode ? [row.barcode] : [],
    },
    price: Number(row.min_price),
    regularPrice: Number(row.regular_price),
    isDeal: row.is_deal,
  }));
}

// Errors are thrown inside the cache so a failed call is retried on the next visit, not kept for a day.
const cachedShowcase = unstable_cache(loadShowcase, ["signin-showcase"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["signin-showcase"],
});

// Server only. An empty list keeps the sign-in page usable when the function is missing or fails.
export async function fetchSigninShowcase(): Promise<CatalogItem[]> {
  try {
    return await cachedShowcase();
  } catch (err) {
    console.warn("[signinShowcase]", err instanceof Error ? err.message : err);
    return [];
  }
}
