import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/dashboard/urls",
  "/dashboard/analytics",
  "/dashboard/settings",
  "/dashboard/billing",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Get session by making a request to the session endpoint
  // This ensures we get the fresh session data after OAuth
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  // Redirect to sign-in if accessing protected route without authentication
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && session) {
    const from = request.nextUrl.searchParams.get("from");
    const redirectUrl = from && from.startsWith("/") ? from : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Check email verification for certain routes
  if (isProtectedRoute && session && !session.user.emailVerified) {
    // Allow access to settings page even without email verification
    if (!pathname.startsWith("/dashboard/settings")) {
      const verifyUrl = new URL("/verify-email", request.url);
      return NextResponse.redirect(verifyUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};