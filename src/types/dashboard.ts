import type { Category } from "./category";
import type { Customer } from "./customer";
import type { Order } from "./order";
import type { Product } from "./product";

export interface DashboardMetric {
  key: "revenue" | "orders" | "newCustomers" | "productsSold";
  label: string;
  value: string;
  change: number;
  hint: string;
}

export interface SalesPoint {
  period: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  sold: number;
  revenue: number;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  salesSeries: SalesPoint[];
  categorySales: CategorySales[];
  recentOrders: Order[];
  topProducts: Product[];
  lowStockProducts: Product[];
  newCustomers: Customer[];
  categories: Category[];
}
