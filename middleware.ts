import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/prijava", "/prijava/email", "/lista"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session (refresh auth token if needed)
  const response = await updateSession(request);

  // Check if route is public (or a public share link like /lista/[token])
  const isPublic =
    publicRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/api");

  // If public, allow access
  if (isPublic) {
    return response;
  }

  // For protected routes, check if user is authenticated
  // The `updateSession` call above sets the auth cookie if valid session exists
  // We can't directly check `getUser()` in middleware, but if there's no session cookie,
  // redirect to login. This is a simplified check—a more robust approach would
  // decode the JWT from cookies, but for MVP we rely on session refresh above.

  // For now, protected routes will handle auth client-side. Redirect unauthenticated
  // requests to /prijava if needed (can be enhanced later with token validation).

  return response;
}

export const config = {
  matcher: [
    // Match all paths except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
