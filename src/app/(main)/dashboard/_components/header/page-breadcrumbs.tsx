"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { findNavigationTrail } from "@/config/navigation.config";

/** Breadcrumbs derived from the central navigation config. */
export function PageBreadcrumbs() {
  const pathname = usePathname();
  const trail = findNavigationTrail(pathname);

  if (!trail) {
    return null;
  }

  const currentTitle = trail.subItem?.title ?? trail.item.title;
  const isDashboardRoot = pathname === "/dashboard";

  return (
    <Breadcrumb className="hidden min-w-0 md:block">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          {isDashboardRoot ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isDashboardRoot && trail.group.label ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span>{trail.group.label}</span>
            </BreadcrumbItem>
          </>
        ) : null}
        {!isDashboardRoot ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
