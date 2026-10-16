import { NextResponse, type NextRequest } from "next/server";
import { storeUrlFor } from "@/lib/storeLinks";

// The target of the QR code in Podešavanja: one link that works for both phones.
export function GET(request: NextRequest) {
  return NextResponse.redirect(storeUrlFor(request.headers.get("user-agent")), 307);
}
