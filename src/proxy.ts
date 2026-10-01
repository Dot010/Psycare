import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "psycare_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get(COOKIE_NAME)?.value;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/health") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/payments");

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/health/:path*",
    "/chat/:path*",
    "/payments/:path*",
    "/login",
    "/register",
  ],
};
