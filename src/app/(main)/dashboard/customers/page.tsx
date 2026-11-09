import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { CustomersView } from "./_components/customers-view";

export const metadata = createMetadata({
  title: "Customers",
  description: "Browse customer profiles, spending, and account status.",
  path: "/dashboard/customers",
});

export default async function CustomersPage() {
  await requirePermission("customer:read");

  return <CustomersView />;
}
