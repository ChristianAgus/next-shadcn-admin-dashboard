"use server";

import { cookies } from "next/headers";

import { getServerEnv } from "@/config/env";
import { can } from "@/lib/auth/permissions";
import { getSession, getSessionCookieOptions } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/session-token";
import { loginSchema } from "@/lib/validation/auth";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginActionState } from "@/types/auth";

export interface LoginActionInput {
  email: string;
  password: string;
  remember?: boolean;
  redirectTo?: string;
}

function getSafeRedirect(value: string | undefined) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/dashboard";
}

export async function loginAction(input: LoginActionInput): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }

  try {
    const env = getServerEnv();
    const result = await authService.login(parsed.data);

    if (!result.ok) {
      return result;
    }

    const maxAge = parsed.data.remember ? 60 * 60 * 24 * 30 : env.SESSION_MAX_AGE;
    const token = await createSessionToken(
      { user: result.user, expiresAt: Date.now() + maxAge * 1000 },
      env.AUTH_SECRET,
    );
    const cookieStore = await cookies();
    cookieStore.set(env.SESSION_COOKIE_NAME, token, getSessionCookieOptions(maxAge));

    return { ok: true, redirectTo: getSafeRedirect(input.redirectTo) };
  } catch (error) {
    console.error("Login failed", error);
    return { ok: false, error: "Unable to sign in. Check your environment configuration and try again." };
  }
}

export async function logoutAction(): Promise<{ ok: true }> {
  const { SESSION_COOKIE_NAME } = getServerEnv();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return { ok: true };
}

export async function updateSessionProfileAction(input: {
  name: string;
  avatar?: string;
}): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  if (!can(session.user, "profile:update")) {
    return { ok: false, error: "You do not have permission to update this profile." };
  }

  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, error: "Name must be at least 2 characters." };
  }

  const env = getServerEnv();
  const updatedUser: AuthUser = { ...session.user, name, avatar: input.avatar ?? undefined };
  const updatedSession = { ...session, user: updatedUser };
  const token = await createSessionToken(updatedSession, env.AUTH_SECRET);
  const maxAge = Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000));
  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, getSessionCookieOptions(maxAge));

  return { ok: true, user: updatedUser };
}
