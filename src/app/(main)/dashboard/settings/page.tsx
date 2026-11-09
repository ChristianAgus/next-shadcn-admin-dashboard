import { requireSession } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { SettingsView } from "./_components/settings-view";

export const metadata = createMetadata({
  title: "Settings",
  description: "Update your profile, store details, and appearance.",
  path: "/dashboard/settings",
});

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireSession();
  const { tab } = await searchParams;
  const defaultTab = tab === "store" || tab === "appearance" ? tab : "profile";

  return <SettingsView defaultTab={defaultTab} />;
}
