import Link from "next/link";

import { ArrowRight, PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/product";

export function LowStock({ products }: { readonly products: Product[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Low stock</CardTitle>
        <CardDescription>Active products with 10 units or fewer.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/products">
              Manage
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Stock looks healthy"
            description="No active product is running low right now."
            className="border-0 py-6"
          />
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{product.sku}</p>
                </div>
                <StatusBadge status={product.stock === 0 ? "Out of stock" : `${product.stock} left`} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
