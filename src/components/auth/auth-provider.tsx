"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { Permission } from "@/config/roles.config";
import { can as checkPermission } from "@/lib/auth/permissions";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser;
  can: (permission: Permission | Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ user, children }: { user: AuthUser; children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user, can: (permission) => checkPermission(user, permission) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("usePermission must be used inside <AuthProvider>.");
  }

  return {
    ...context,
    hasRole: (roleId: string) => context.user.roleId === roleId,
  };
}

export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { can } = usePermission();
  return can(permission) ? children : fallback;
}
