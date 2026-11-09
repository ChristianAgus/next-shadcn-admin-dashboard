import type { Permission } from "@/config/roles.config";
import type { AuthUser } from "@/types/auth";

/** Central permission check used by server guards, the sidebar, and `<Can>`. */
export function can(
  user: Pick<AuthUser, "permissions"> | null | undefined,
  permission: Permission | Permission[],
): boolean {
  if (!user) {
    return false;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((item) => user.permissions.includes(item));
}
