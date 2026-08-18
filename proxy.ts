import { updateSession } from "@/lib/supabase/proxy";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  { path: "lista", exact: true },
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

  // If user is authenticated and trying to access /prijava, redirect to /proizvodi
  if (user && pathname.startsWith("/prijava")) {
    const redirectResponse = NextResponse.redirect(new URL("/proizvodi", request.url));
    // Copy any cookies from the session update to the redirect response
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  }

  // Protected routes: require authentication
  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL("/prijava", request.url));
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
    // Match all paths except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
