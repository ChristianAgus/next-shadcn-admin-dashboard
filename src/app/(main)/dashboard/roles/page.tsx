import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { RolesView } from "./_components/roles-view";

export const metadata = createMetadata({
  title: "Roles & permissions",
  description: "Review roles and tune the permission matrix.",
  path: "/dashboard/roles",
});

export default async function RolesPage() {
  await requirePermission("role:read");

  return <RolesView />;
}
