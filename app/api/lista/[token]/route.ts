import { NextResponse } from "next/server";
import { fetchSharedList } from "@/lib/services/sharedList";

// Client refreshes of the shared list (initial render, realtime updates, retry).
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await fetchSharedList(token);

  if (result.status === "not-found") {
    return NextResponse.json({ error: "Lista nije pronađena ili deljenje više nije aktivno." }, { status: 404 });
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }
  return NextResponse.json(result.list);
}
