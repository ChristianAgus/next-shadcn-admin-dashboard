import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types/category";

export function CatalogSummary({ categories }: { readonly categories: Category[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Catalog</CardTitle>
        <CardDescription>Product distribution across categories.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/categories">
              Manage
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg px-2.5 py-2">
            <span className="truncate text-sm">{category.name}</span>
            <span className="text-muted-foreground text-xs tabular-nums">{category.productCount} products</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
