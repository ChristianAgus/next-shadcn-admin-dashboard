import { APP_CONFIG } from "@/config/app.config";
import type { CategorySales, DashboardMetric, DashboardSnapshot, SalesPoint } from "@/types/dashboard";

import { mockDb } from "./db";

const currencyFormatter = new Intl.NumberFormat(APP_CONFIG.locale, {
  style: "currency",
  currency: APP_CONFIG.currency,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(APP_CONFIG.locale);

const monthlyRevenue = [38400, 42150, 39900, 45600, 48200, 51300, 49800, 54100, 57600, 60800, 64200, 68400];
const monthlyOrders = [284, 312, 298, 336, 352, 371, 364, 389, 402, 418, 436, 452];

function getMonthlySeries(): SalesPoint[] {
  const now = new Date();

  return monthlyRevenue.map((revenue, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthlyRevenue.length - 1 - index), 1);

    return {
      period: new Intl.DateTimeFormat(APP_CONFIG.locale, { month: "short", year: "2-digit" }).format(date),
      revenue,
      orders: monthlyOrders[index] ?? 0,
    };
  });
}

function getCategorySales(): CategorySales[] {
  const totals = new Map<string, CategorySales>();

  for (const product of mockDb.products) {
    const current = totals.get(product.categoryName) ?? {
      category: product.categoryName,
      sold: 0,
      revenue: 0,
    };

    current.sold += product.sold;
    current.revenue += product.sold * product.price;
    totals.set(product.categoryName, current);
  }

  return [...totals.values()].sort((left, right) => right.sold - left.sold);
}

function getNewCustomerCount() {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return mockDb.customers.filter((customer) => new Date(customer.createdAt).getTime() >= thirtyDaysAgo).length;
}

/**
 * Computes the dashboard snapshot from the mock database.
 * Replace this with `GET /dashboard/overview` when the API is available.
 */
export function getDashboardSnapshot(): DashboardSnapshot {
  const completedStatuses = new Set(["paid", "shipped", "completed"]);
  const revenue = mockDb.orders
    .filter((order) => completedStatuses.has(order.status))
    .reduce((total, order) => total + order.total, 0);
  const productsSold = mockDb.products.reduce((total, product) => total + product.sold, 0);
  const newCustomerCount = getNewCustomerCount();

  const metrics: DashboardMetric[] = [
    {
      key: "revenue",
      label: "Total revenue",
      value: currencyFormatter.format(revenue),
      change: 15.8,
      hint: "vs. previous month",
    },
    {
      key: "orders",
      label: "Total orders",
      value: numberFormatter.format(mockDb.orders.length),
      change: 8.3,
      hint: "vs. previous month",
    },
    {
      key: "newCustomers",
      label: "New customers",
      value: numberFormatter.format(newCustomerCount),
      change: 12.5,
      hint: "in the last 30 days",
    },
    {
      key: "productsSold",
      label: "Products sold",
      value: numberFormatter.format(productsSold),
      change: 6.4,
      hint: "all-time units",
    },
  ];

  const sortedOrders = [...mockDb.orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const sortedCustomers = [...mockDb.customers].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return {
    metrics,
    salesSeries: getMonthlySeries(),
    categorySales: getCategorySales(),
    recentOrders: sortedOrders.slice(0, 6),
    topProducts: [...mockDb.products].sort((left, right) => right.sold - left.sold).slice(0, 5),
    lowStockProducts: mockDb.products
      .filter((product) => product.stock <= 10 && product.status === "active")
      .sort((left, right) => left.stock - right.stock)
      .slice(0, 6),
    newCustomers: sortedCustomers.slice(0, 5),
    categories: mockDb.categories,
  };
}
