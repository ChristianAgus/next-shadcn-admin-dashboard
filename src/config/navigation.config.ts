import {
  LayoutDashboard,
  type LucideIcon,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  UserCog,
  Users,
} from "lucide-react";

import type { AuthUser } from "@/types/auth";

import type { Permission } from "./roles.config";

export type NavBadge = "new" | "updated" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
  permission?: Permission;
}

interface NavItemBase {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
  permission?: Permission;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: string;
  label?: string;
  items: NavMainItem[];
}

/**
 * Every sidebar item and breadcrumb label lives here. Components never
 * hardcode menu labels.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Store performance, sales trends, recent orders, and inventory alerts.",
        url: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:read",
      },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        id: "products",
        title: "Products",
        description: "Manage product details, pricing, stock, and availability.",
        url: "/dashboard/products",
        icon: Package,
        permission: "product:read",
      },
      {
        id: "categories",
        title: "Categories",
        description: "Group products into shoppable catalog categories.",
        url: "/dashboard/categories",
        icon: Tags,
        permission: "category:read",
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      {
        id: "orders",
        title: "Orders",
        description: "Track orders, update fulfillment status, and review order value.",
        url: "/dashboard/orders",
        icon: ShoppingCart,
        permission: "order:read",
      },
      {
        id: "customers",
        title: "Customers",
        description: "Browse customer profiles, spending, and account status.",
        url: "/dashboard/customers",
        icon: Users,
        permission: "customer:read",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        id: "users",
        title: "Users",
        description: "Invite administrators and assign roles.",
        url: "/dashboard/users",
        icon: UserCog,
        permission: "user:read",
      },
      {
        id: "roles",
        title: "Roles & permissions",
        description: "Review roles and tune the permission matrix.",
        url: "/dashboard/roles",
        icon: ShieldCheck,
        permission: "role:read",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "settings",
        title: "Settings",
        description: "Update your profile, store details, and appearance.",
        url: "/dashboard/settings",
        icon: Settings,
        permission: "settings:read",
      },
    ],
  },
];

function canSee(user: AuthUser | null, permission?: Permission) {
  if (!permission) {
    return true;
  }

  return Boolean(user?.permissions.includes(permission));
}

/** Returns a role-filtered copy of the navigation tree. */
export function getNavigationForUser(user: AuthUser | null): NavGroup[] {
  return NAVIGATION.map((group) => {
    const items = group.items
      .map((item) => {
        if (!canSee(user, item.permission)) {
          return null;
        }

        if (item.subItems) {
          const subItems = item.subItems.filter((subItem) => canSee(user, subItem.permission));
          return subItems.length > 0 ? { ...item, subItems } : null;
        }

        return item;
      })
      .filter((item): item is NavMainItem => item !== null);

    return { ...group, items };
  }).filter((group) => group.items.length > 0);
}

export interface NavigationTrail {
  group: NavGroup;
  item: NavMainItem;
  subItem?: NavSubItem;
}

/** Finds the navigation entry that owns a pathname. Used by breadcrumbs and metadata. */
export function findNavigationTrail(pathname: string): NavigationTrail | undefined {
  const normalizedPath = pathname.split("?")[0]?.replace(/\/$/, "") || "/";

  for (const group of NAVIGATION) {
    for (const item of group.items) {
      if (item.subItems) {
        const subItem = item.subItems.find((sub) => sub.url === normalizedPath);
        if (subItem) {
          return { group, item, subItem };
        }
      }

      if ("url" in item && item.url === normalizedPath) {
        return { group, item };
      }
    }
  }

  return undefined;
}

export function getPageMeta(pathname: string) {
  const trail = findNavigationTrail(pathname);

  return {
    title: trail?.subItem?.title ?? trail?.item.title ?? "Dashboard",
    description: trail?.subItem?.title ?? trail?.item.description ?? "E-commerce admin dashboard.",
    group: trail?.group.label,
  };
}

export function flattenNavigation(groups: NavGroup[] = NAVIGATION) {
  return groups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems
        ? item.subItems.map((subItem) => ({
            id: subItem.id,
            title: subItem.title,
            url: subItem.url,
            group: group.label ?? item.title,
            icon: subItem.icon ?? item.icon,
            disabled: subItem.disabled,
            newTab: subItem.newTab,
          }))
        : [
            {
              id: item.id,
              title: item.title,
              url: item.url,
              group: group.label ?? "Other",
              icon: item.icon,
              disabled: item.disabled,
              newTab: item.newTab,
            },
          ],
    ),
  );
}
