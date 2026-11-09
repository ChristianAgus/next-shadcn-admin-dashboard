import { APP_CONFIG } from "@/config/app.config";
import type { Order, OrderStatus } from "@/types/order";

import { seedCustomers } from "./customers.mock";

interface OrderSeed {
  customerIndex: number;
  status: OrderStatus;
  itemCount: number;
  total: number;
  daysAgo: number;
}

const seeds: OrderSeed[] = [
  { customerIndex: 0, status: "completed", itemCount: 3, total: 186, daysAgo: 1 },
  { customerIndex: 2, status: "paid", itemCount: 2, total: 258, daysAgo: 1 },
  { customerIndex: 4, status: "pending", itemCount: 1, total: 119, daysAgo: 2 },
  { customerIndex: 1, status: "shipped", itemCount: 4, total: 344, daysAgo: 2 },
  { customerIndex: 6, status: "completed", itemCount: 2, total: 97, daysAgo: 3 },
  { customerIndex: 3, status: "cancelled", itemCount: 1, total: 68, daysAgo: 4 },
  { customerIndex: 8, status: "paid", itemCount: 5, total: 412, daysAgo: 5 },
  { customerIndex: 5, status: "shipped", itemCount: 2, total: 158, daysAgo: 6 },
  { customerIndex: 9, status: "completed", itemCount: 3, total: 267, daysAgo: 7 },
  { customerIndex: 10, status: "pending", itemCount: 1, total: 129, daysAgo: 8 },
  { customerIndex: 7, status: "paid", itemCount: 2, total: 138, daysAgo: 9 },
  { customerIndex: 11, status: "completed", itemCount: 1, total: 129, daysAgo: 10 },
  { customerIndex: 0, status: "shipped", itemCount: 4, total: 356, daysAgo: 12 },
  { customerIndex: 2, status: "completed", itemCount: 6, total: 624, daysAgo: 14 },
  { customerIndex: 4, status: "cancelled", itemCount: 2, total: 144, daysAgo: 16 },
  { customerIndex: 1, status: "completed", itemCount: 3, total: 233, daysAgo: 18 },
  { customerIndex: 6, status: "paid", itemCount: 1, total: 85, daysAgo: 20 },
  { customerIndex: 8, status: "completed", itemCount: 2, total: 198, daysAgo: 23 },
  { customerIndex: 3, status: "shipped", itemCount: 3, total: 242, daysAgo: 26 },
  { customerIndex: 9, status: "pending", itemCount: 2, total: 78, daysAgo: 29 },
  { customerIndex: 5, status: "completed", itemCount: 5, total: 490, daysAgo: 32 },
  { customerIndex: 7, status: "paid", itemCount: 1, total: 42, daysAgo: 35 },
  { customerIndex: 10, status: "completed", itemCount: 2, total: 204, daysAgo: 38 },
  { customerIndex: 11, status: "cancelled", itemCount: 1, total: 49, daysAgo: 41 },
];

const dayInMs = 24 * 60 * 60 * 1000;

export const seedOrders: Order[] = seeds.map((seed, index) => {
  const customer = seedCustomers[seed.customerIndex];
  const createdAt = new Date(Date.now() - seed.daysAgo * dayInMs).toISOString();

  return {
    id: `ord-${String(index + 1).padStart(3, "0")}`,
    orderNumber: `ORD-2026-${1100 + index}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    status: seed.status,
    itemCount: seed.itemCount,
    total: seed.total,
    currency: APP_CONFIG.currency,
    shippingAddress: `${customer.city}, ${customer.country}`,
    createdAt,
    updatedAt: createdAt,
  };
});
