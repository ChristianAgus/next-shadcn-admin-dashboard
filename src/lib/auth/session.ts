import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerEnv } from "@/config/env";
import type { Permission } from "@/config/roles.config";
import type { Session } from "@/types/auth";

import { can } from "./permissions";
import { verifySessionToken } from "./session-token";

export function getSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function getSession(): Promise<Session | null> {
  const { AUTH_SECRET, SESSION_COOKIE_NAME } = getServerEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, AUTH_SECRET);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/** Server-side route guard. Redirects to the 403 page when permission is missing. */
export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await requireSession();

  if (!can(session.user, permission)) {
    redirect(`/unauthorized?permission=${encodeURIComponent(permission)}`);
  }

  return session;
}
