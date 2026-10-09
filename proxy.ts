import { updateSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  { path: "lista", exact: false },
  { path: "prijava", exact: false },
  { path: "auth/callback", exact: false },
  { path: "api/lista", exact: false },
];

function isRoutePublic(pathname: string): boolean {
  // Root path is always public
  if (pathname === "/") return true;

  return publicRoutes.some((route) => {
    const fullPath = `/${route.path}`;
    return route.exact ? pathname === fullPath : pathname.startsWith(fullPath);
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session (refresh auth token if needed) and get user
  const { response, user } = await updateSession(request);

  // Check if route is public
  const isPublic = isRoutePublic(pathname);

  // Public routes: allow access
  if (isPublic) {
    return response;
  }

  // Protected routes: require authentication, and come back to the same page afterwards.
  if (!user) {
    if (pathname.startsWith("/api/")) {
      const unauthorized = NextResponse.json({ error: "Nisi prijavljen." }, { status: 401 });
      response.cookies.getAll().forEach(({ name, value, ...options }) => unauthorized.cookies.set(name, value, options));
      return unauthorized;
    }
    const signIn = new URL("/prijava", request.url);
    if (pathname !== "/proizvodi") signIn.searchParams.set("next", pathname + request.nextUrl.search);
    const redirectResponse = NextResponse.redirect(signIn);
    // Copy any cookies from the session update to the redirect response
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  }

  // User is authenticated and accessing a protected route
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)",
  ],
};
