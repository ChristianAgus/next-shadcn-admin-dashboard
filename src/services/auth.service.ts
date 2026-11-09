import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { authenticateMock } from "@/mocks/auth.mock";
import type { AuthUser, LoginInput, LoginResult } from "@/types/auth";

interface LoginResponse {
  user: AuthUser;
  token?: string;
}

export const authService = {
  /**
   * Mock mode: `authenticateMock`.
   * Real API: `POST /auth/login` → `{ user }` and an httpOnly cookie set by the server.
   */
  async login(input: LoginInput): Promise<LoginResult> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      return authenticateMock(input);
    }

    try {
      const response = await apiClient<LoginResponse>("/auth/login", {
        method: "POST",
        json: { email: input.email, password: input.password },
      });

      return { ok: true, user: response.user };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to sign in.",
      };
    }
  },

  /** Real API: `POST /auth/logout`. The server clears the session cookie. */
  async logout(): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      return;
    }

    await apiClient<void>("/auth/logout", { method: "POST" });
  },
};
