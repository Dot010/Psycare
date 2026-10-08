import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { canAccess, homeFor } from "@/lib/roles";
import { buildCsp } from "@/lib/security/csp";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await verifySession(request.cookies.get(COOKIE_NAME)?.value);
  const isAuthenticated = session !== null;

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // cookie inválido/expirado: limpa para não ficar em loop de redirecionamento
    if (request.cookies.has(COOKIE_NAME)) response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (session && isProtectedRoute && !canAccess(session, pathname)) {
    return NextResponse.redirect(new URL(homeFor(session), request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL(homeFor(session), request.url));
  }

  // CSP com nonce por requisição (o Next aplica o nonce nos scripts durante o SSR).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === "development",
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Tudo, exceto API, assets estáticos e favicon; ignora prefetch do next/link.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
