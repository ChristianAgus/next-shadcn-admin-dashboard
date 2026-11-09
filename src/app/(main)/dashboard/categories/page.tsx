import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { CategoriesView } from "./_components/categories-view";

export const metadata = createMetadata({
  title: "Categories",
  description: "Group products into shoppable catalog categories.",
  path: "/dashboard/categories",
});

export default async function CategoriesPage() {
  await requirePermission("category:read");

  return <CategoriesView />;
}
