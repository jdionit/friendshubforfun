// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect any route that starts with /admin
  if (pathname.startsWith("/admin")) {
    // Check for Supabase auth cookie (the key is usually sb-<project-ref>-auth-token)
    const hasAuthCookie = request.cookies
      .getAll()
      .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

    if (!hasAuthCookie) {
      // No session cookie found -> redirect to login instantly
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other routes to pass through
  return NextResponse.next();
}

// Only run middleware on /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};