import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { ListParams, PaginatedResponse } from "@/types/common";
import type { Customer, CustomerInput } from "@/types/customer";

function applyFilters(params: ListParams) {
  const status = params.filters?.status;
  const filtered = mockDb.customers.filter((customer) => {
    const matchesStatus = !status || customer.status === status;
    return (
      matchesStatus && matchesSearch(params.search, [customer.name, customer.email, customer.phone, customer.city])
    );
  });

  return sortItems(filtered, params.sortBy, params.sortDir, (customer, key) => {
    if (key === "totalSpent") return customer.totalSpent;
    if (key === "ordersCount") return customer.ordersCount;
    if (key === "name") return customer.name;
    return customer.createdAt;
  });
}

function findCustomer(id: string) {
  const customer = mockDb.customers.find((item) => item.id === id);
  if (!customer) throw new Error("Customer not found.");
  return customer;
}

export const customerService = {
  /** GET /customers?page=&pageSize=&search=&status=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Customer>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Customer>>(`/customers${toQueryString(params)}`);
  },

  /** GET /customers/:id */
  async getById(id: string): Promise<Customer> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      return findCustomer(id);
    }

    return apiClient<Customer>(`/customers/${id}`);
  },

  /** POST /customers */
  async create(input: CustomerInput): Promise<Customer> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const timestamp = nowIso();
      const customer: Customer = {
        ...input,
        id: makeId("cus"),
        ordersCount: 0,
        totalSpent: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.customers.unshift(customer);
      return customer;
    }

    return apiClient<Customer>("/customers", { method: "POST", json: input });
  },

  /** PATCH /customers/:id */
  async update(id: string, input: CustomerInput): Promise<Customer> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.customers.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Customer not found.");

      const updated: Customer = {
        ...mockDb.customers[index],
        ...input,
        updatedAt: nowIso(),
      };
      mockDb.customers[index] = updated;
      return updated;
    }

    return apiClient<Customer>(`/customers/${id}`, { method: "PATCH", json: input });
  },

  /** DELETE /customers/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      mockDb.customers = mockDb.customers.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/customers/${id}`, { method: "DELETE" });
  },
};
