import { NextResponse, type NextRequest } from "next/server";
import { storeUrlFor } from "@/lib/storeLinks";

// The target of the QR code in Podešavanja: one link that works for both phones.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(storeUrlFor(request.headers.get("user-agent")), 307);
  // The target depends on the device, so no cache may hand one device's store to another.
  response.headers.set("Vary", "User-Agent");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
