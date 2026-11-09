import { type NextRequest, NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth/session-token";
import type { Session } from "@/types/auth";

const DEFAULT_COOKIE_NAME = "store_admin_session";

async function readSession(request: NextRequest): Promise<Session | null> {
  const cookieName = process.env.SESSION_COOKIE_NAME ?? DEFAULT_COOKIE_NAME;
  const token = request.cookies.get(cookieName)?.value;
  const secret = process.env.AUTH_SECRET;

  if (!token || !secret) {
    return null;
  }

  return verifySessionToken(token, secret);
}

/**
 * Next.js 16 renamed Middleware to Proxy. This is the equivalent of
 * `middleware.ts` and protects every `/dashboard` route.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request);
  const isLoginRoute = pathname === "/login";
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
