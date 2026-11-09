import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { ProductsView } from "./_components/products-view";

export const metadata = createMetadata({
  title: "Products",
  description: "Manage product details, pricing, stock, and availability.",
  path: "/dashboard/products",
});

export default async function ProductsPage() {
  await requirePermission("product:read");

  return <ProductsView />;
}
