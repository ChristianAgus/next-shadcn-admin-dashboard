import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { UsersView } from "./_components/users-view";

export const metadata = createMetadata({
  title: "Users",
  description: "Invite administrators and assign roles.",
  path: "/dashboard/users",
});

export default async function UsersPage() {
  await requirePermission("user:read");

  return <UsersView />;
}
