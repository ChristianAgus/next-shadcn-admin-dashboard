import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";
import { dashboardService } from "@/services/dashboard.service";

import { CatalogSummary } from "./_components/overview/catalog-summary";
import { CategoryChart } from "./_components/overview/category-chart";
import { LowStock } from "./_components/overview/low-stock";
import { MetricCards } from "./_components/overview/metric-cards";
import { NewCustomers } from "./_components/overview/new-customers";
import { RecentOrders } from "./_components/overview/recent-orders";
import { SalesChart } from "./_components/overview/sales-chart";
import { TopProducts } from "./_components/overview/top-products";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Store performance, sales trends, recent orders, and inventory alerts.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  await requirePermission("dashboard:read");
  const snapshot = await dashboardService.getOverview();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="A quick read on revenue, orders, customers, and inventory health."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/orders">
              Review orders
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <MetricCards metrics={snapshot.metrics} />

      <div className="grid gap-4 xl:grid-cols-7">
        <div className="xl:col-span-4">
          <SalesChart data={snapshot.salesSeries} />
        </div>
        <div className="xl:col-span-3">
          <CategoryChart data={snapshot.categorySales} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <div className="xl:col-span-4">
          <RecentOrders orders={snapshot.recentOrders} />
        </div>
        <div className="grid content-start gap-4 xl:col-span-3">
          <TopProducts products={snapshot.topProducts} />
          <LowStock products={snapshot.lowStockProducts} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NewCustomers customers={snapshot.newCustomers} />
        <CatalogSummary categories={snapshot.categories} />
      </div>
    </div>
  );
}
