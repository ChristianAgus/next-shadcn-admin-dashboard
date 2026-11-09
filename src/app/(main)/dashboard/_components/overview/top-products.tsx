import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatNumber } from "@/lib/format";
import type { Product } from "@/types/product";

export function TopProducts({ products }: { readonly products: Product[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>Best sellers by units sold.</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/products">
              View all
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
            <span className="bg-muted text-muted-foreground grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {product.categoryName} · {formatNumber(product.sold)} sold
              </p>
            </div>
            <span className="text-sm font-medium">{formatMoney(product.price * product.sold, undefined, 0)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
