/**
 * Central role and permission registry.
 *
 * Permissions use the `resource:action` format. Add a role by:
 * 1. adding its id to `ROLE_IDS`,
 * 2. adding its definition to `ROLES`.
 *
 * The sidebar, route guards, and `<Can>` component all read from this file.
 */

export const PERMISSIONS = [
  { id: "dashboard:read", group: "Dashboard", label: "View dashboard", resource: "dashboard", action: "read" },
  { id: "product:read", group: "Products", label: "View products", resource: "product", action: "read" },
  { id: "product:create", group: "Products", label: "Create products", resource: "product", action: "create" },
  { id: "product:update", group: "Products", label: "Update products", resource: "product", action: "update" },
  { id: "product:delete", group: "Products", label: "Delete products", resource: "product", action: "delete" },
  { id: "category:read", group: "Categories", label: "View categories", resource: "category", action: "read" },
  { id: "category:create", group: "Categories", label: "Create categories", resource: "category", action: "create" },
  { id: "category:update", group: "Categories", label: "Update categories", resource: "category", action: "update" },
  { id: "category:delete", group: "Categories", label: "Delete categories", resource: "category", action: "delete" },
  { id: "order:read", group: "Orders", label: "View orders", resource: "order", action: "read" },
  { id: "order:create", group: "Orders", label: "Create orders", resource: "order", action: "create" },
  { id: "order:update", group: "Orders", label: "Update orders", resource: "order", action: "update" },
  { id: "order:delete", group: "Orders", label: "Delete orders", resource: "order", action: "delete" },
  { id: "customer:read", group: "Customers", label: "View customers", resource: "customer", action: "read" },
  { id: "customer:create", group: "Customers", label: "Create customers", resource: "customer", action: "create" },
  { id: "customer:update", group: "Customers", label: "Update customers", resource: "customer", action: "update" },
  { id: "customer:delete", group: "Customers", label: "Delete customers", resource: "customer", action: "delete" },
  { id: "user:read", group: "Users", label: "View users", resource: "user", action: "read" },
  { id: "user:create", group: "Users", label: "Create users", resource: "user", action: "create" },
  { id: "user:update", group: "Users", label: "Update users", resource: "user", action: "update" },
  { id: "user:delete", group: "Users", label: "Delete users", resource: "user", action: "delete" },
  { id: "role:read", group: "Roles", label: "View roles", resource: "role", action: "read" },
  { id: "role:create", group: "Roles", label: "Create roles", resource: "role", action: "create" },
  { id: "role:update", group: "Roles", label: "Update roles", resource: "role", action: "update" },
  { id: "role:delete", group: "Roles", label: "Delete roles", resource: "role", action: "delete" },
  { id: "settings:read", group: "Settings", label: "View settings", resource: "settings", action: "read" },
  { id: "settings:update", group: "Settings", label: "Update settings", resource: "settings", action: "update" },
  { id: "profile:read", group: "Profile", label: "View own profile", resource: "profile", action: "read" },
  { id: "profile:update", group: "Profile", label: "Update own profile", resource: "profile", action: "update" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["id"];

export const PERMISSION_GROUPS = Array.from(new Set(PERMISSIONS.map((permission) => permission.group)));

export const ALL_PERMISSIONS = PERMISSIONS.map((permission) => permission.id) as Permission[];

export const ROLE_IDS = ["super-admin", "manager", "staff"] as const;

export type RoleId = (typeof ROLE_IDS)[number];

export interface RoleDefinition {
  id: RoleId;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export const ROLES: RoleDefinition[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full access to every module, user, role, and setting.",
    permissions: ALL_PERMISSIONS,
    isSystem: true,
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manages the catalog, orders, customers, and store settings.",
    permissions: [
      "dashboard:read",
      "product:read",
      "product:create",
      "product:update",
      "product:delete",
      "category:read",
      "category:create",
      "category:update",
      "category:delete",
      "order:read",
      "order:update",
      "customer:read",
      "customer:update",
      "settings:read",
      "settings:update",
      "profile:read",
      "profile:update",
    ],
    isSystem: true,
  },
  {
    id: "staff",
    name: "Staff",
    description: "Reads catalog data and processes incoming orders.",
    permissions: [
      "dashboard:read",
      "product:read",
      "category:read",
      "order:read",
      "order:update",
      "customer:read",
      "profile:read",
      "profile:update",
    ],
    isSystem: true,
  },
];

export function getRoleDefinition(roleId: string): RoleDefinition | undefined {
  return ROLES.find((role) => role.id === roleId);
}

export function isPermission(value: string): value is Permission {
  return PERMISSIONS.some((permission) => permission.id === value);
}

export function getPermissionsForRole(roleId: string): Permission[] {
  return getRoleDefinition(roleId)?.permissions ?? [];
}
