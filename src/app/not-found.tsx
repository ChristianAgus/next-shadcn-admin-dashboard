import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild className="mt-2" variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
      <p className="text-muted-foreground mt-8 text-xs">{APP_CONFIG.copyright}</p>
    </div>
  );
}
