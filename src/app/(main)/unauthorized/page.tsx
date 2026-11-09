import Link from "next/link";

import { ArrowLeft, LockKeyhole } from "lucide-react";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";
import { getSession } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "403 — Access denied",
  description: "You do not have permission to view this page.",
  path: "/unauthorized",
  noIndex: true,
});

export default async function UnauthorizedPage({ searchParams }: { searchParams: Promise<{ permission?: string }> }) {
  const session = await getSession();
  const { permission } = await searchParams;

  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-2xl">
          <AppLogo className="size-8" />
        </span>
        <p className="text-muted-foreground mt-8 text-sm font-medium tracking-widest uppercase">Error 403</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Access denied</h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Your current role does not include the permission required to open this page.
          {permission ? (
            <>
              {" "}
              Required permission: <code className="bg-muted text-foreground rounded px-1.5 py-0.5">{permission}</code>
            </>
          ) : null}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {session ? (
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft data-icon="inline-start" />
                Back to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Go to sign in</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={session ? "/dashboard/settings" : "/login"}>
              <LockKeyhole data-icon="inline-start" />
              {session ? "Manage permissions" : "Use a demo account"}
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-10 text-xs">{APP_CONFIG.copyright}</p>
      </div>
    </div>
  );
}
