import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { ListParams, PaginatedResponse } from "@/types/common";
import type { Order, OrderInput, OrderStatus } from "@/types/order";

function applyFilters(params: ListParams) {
  const status = params.filters?.status;
  const filtered = mockDb.orders.filter((order) => {
    const matchesStatus = !status || order.status === status;
    return matchesStatus && matchesSearch(params.search, [order.orderNumber, order.customerName, order.customerEmail]);
  });

  return sortItems(filtered, params.sortBy, params.sortDir, (order, key) => {
    if (key === "total") return order.total;
    if (key === "orderNumber") return order.orderNumber;
    return order.createdAt;
  });
}

function findOrder(id: string) {
  const order = mockDb.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");
  return order;
}

export const orderService = {
  /** GET /orders?page=&pageSize=&search=&status=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Order>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Order>>(`/orders${toQueryString(params)}`);
  },

  /** GET /orders/:id */
  async getById(id: string): Promise<Order> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      return findOrder(id);
    }

    return apiClient<Order>(`/orders/${id}`);
  },

  /** POST /orders */
  async create(input: OrderInput): Promise<Order> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const customer = mockDb.customers.find((item) => item.id === input.customerId);
      if (!customer) throw new Error("Customer not found.");

      const timestamp = nowIso();
      const order: Order = {
        ...input,
        id: makeId("ord"),
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customer.name,
        customerEmail: customer.email,
        currency: mockDb.orders[0]?.currency ?? "USD",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.orders.unshift(order);
      return order;
    }

    return apiClient<Order>("/orders", { method: "POST", json: input });
  },

  /** PATCH /orders/:id */
  async update(id: string, input: OrderInput): Promise<Order> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.orders.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Order not found.");

      const customer = mockDb.customers.find((item) => item.id === input.customerId);
      const updated: Order = {
        ...mockDb.orders[index],
        ...input,
        customerName: customer?.name ?? mockDb.orders[index].customerName,
        customerEmail: customer?.email ?? mockDb.orders[index].customerEmail,
        updatedAt: nowIso(),
      };
      mockDb.orders[index] = updated;
      return updated;
    }

    return apiClient<Order>(`/orders/${id}`, { method: "PATCH", json: input });
  },

  /** PATCH /orders/:id/status */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(220);
      const index = mockDb.orders.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Order not found.");

      const updated: Order = { ...mockDb.orders[index], status, updatedAt: nowIso() };
      mockDb.orders[index] = updated;
      return updated;
    }

    return apiClient<Order>(`/orders/${id}/status`, { method: "PATCH", json: { status } });
  },

  /** DELETE /orders/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      mockDb.orders = mockDb.orders.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/orders/${id}`, { method: "DELETE" });
  },
};
