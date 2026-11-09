import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import type { DashboardMetric } from "@/types/dashboard";

const metricIcons: Record<DashboardMetric["key"], LucideIcon> = {
  revenue: DollarSign,
  orders: ShoppingCart,
  newCustomers: UserPlus,
  productsSold: Package,
};

export function MetricCards({ metrics }: { readonly metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.key];
        const isPositive = metric.change >= 0;

        return (
          <Card key={metric.key} size="sm">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {metric.label}
              </CardTitle>
              <span className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-md">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {formatPercent(metric.change)}
                </span>
                <span className="text-muted-foreground">{metric.hint}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
