import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { OrdersView } from "./_components/orders-view";

export const metadata = createMetadata({
  title: "Orders",
  description: "Track orders, update fulfillment status, and review order value.",
  path: "/dashboard/orders",
});

export default async function OrdersPage() {
  await requirePermission("order:read");

  return <OrdersView />;
}
