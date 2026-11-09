import type { Permission } from "@/config/roles.config";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface Session {
  user: AuthUser;
  expiresAt: number;
}

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export type LoginResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export type LoginActionState = { ok: true; redirectTo: string } | { ok: false; error: string };
