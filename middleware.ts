import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_EXACT = ["/"];
const PUBLIC_PREFIXES = ["/prijava", "/auth/callback", "/lista", "/api/lista"];

function isPublicRoute(pathname: string) {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);
  const isAuthRoute =
    pathname === "/prijava" || pathname.startsWith("/prijava/");

  if (user && isAuthRoute) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(
      new URL(next || "/proizvodi", request.url)
    );
  }

  if (isPublicRoute(pathname)) {
    return response;
  }

  if (!user) {
    const redirectUrl = new URL("/prijava", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
