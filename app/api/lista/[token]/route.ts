import { NextResponse } from "next/server";

type SupabaseList = { id: string; name: string };
type SupabaseItem = {
  product_id: string;
  quantity: number;
  products: { product_name: string; barcodes: { barcode: string }[] | null } | null;
};

function supabaseHeaders() {
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return key ? { apikey: key, Authorization: `Bearer ${key}` } : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const headers = supabaseHeaders();

  if (!url || !headers) {
    return NextResponse.json({ error: "Aplikacija nije povezana sa bazom." }, { status: 503 });
  }

  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ error: "Lista nije pronađena." }, { status: 404 });
  }

  const listResponse = await fetch(
    `${url}/rest/v1/shopping_lists?select=id,name&share_token=eq.${encodeURIComponent(token)}&limit=1`,
    { headers, cache: "no-store" },
  );
  if (!listResponse.ok) return NextResponse.json({ error: "Lista trenutno nije dostupna." }, { status: 502 });

  const lists = (await listResponse.json()) as SupabaseList[];
  const list = lists[0];
  if (!list) return NextResponse.json({ error: "Lista nije pronađena ili deljenje više nije aktivno." }, { status: 404 });

  const itemsResponse = await fetch(
    `${url}/rest/v1/shopping_list_items?select=product_id,quantity,products(product_name,barcodes(barcode))&shopping_list_id=eq.${list.id}&order=created_at.asc`,
    { headers, cache: "no-store" },
  );
  if (!itemsResponse.ok) return NextResponse.json({ error: "Stavke liste trenutno nisu dostupne." }, { status: 502 });

  const rows = (await itemsResponse.json()) as SupabaseItem[];
  return NextResponse.json({
    id: list.id,
    name: list.name || "Lista za kupovinu",
    items: rows.map((row) => ({
      productId: row.product_id,
      productName: row.products?.product_name || "Proizvod",
      primaryBarcode: row.products?.barcodes?.[0]?.barcode || "",
      quantity: row.quantity,
    })),
  });
}
