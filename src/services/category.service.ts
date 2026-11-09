import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { Category, CategoryInput } from "@/types/category";
import type { ListParams, PaginatedResponse } from "@/types/common";

function withProductCount(category: Category): Category {
  return {
    ...category,
    productCount: mockDb.products.filter((product) => product.categoryId === category.id).length,
  };
}

function applyFilters(params: ListParams) {
  const status = params.filters?.status;
  const filtered = mockDb.categories.map(withProductCount).filter((category) => {
    const matchesStatus = !status || category.status === status;
    return matchesStatus && matchesSearch(params.search, [category.name, category.slug]);
  });

  return sortItems(filtered, params.sortBy, params.sortDir, (category, key) => {
    if (key === "productCount") return category.productCount;
    if (key === "name") return category.name;
    return category.createdAt;
  });
}

export const categoryService = {
  /** GET /categories?page=&pageSize=&search=&status=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Category>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Category>>(`/categories${toQueryString(params)}`);
  },

  /** GET /categories/:id */
  async getById(id: string): Promise<Category> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      const category = mockDb.categories.find((item) => item.id === id);
      if (!category) throw new Error("Category not found.");
      return withProductCount(category);
    }

    return apiClient<Category>(`/categories/${id}`);
  },

  /** POST /categories */
  async create(input: CategoryInput): Promise<Category> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const timestamp = nowIso();
      const category: Category = {
        ...input,
        id: makeId("cat"),
        productCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.categories.unshift(category);
      return category;
    }

    return apiClient<Category>("/categories", { method: "POST", json: input });
  },

  /** PATCH /categories/:id */
  async update(id: string, input: CategoryInput): Promise<Category> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.categories.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Category not found.");

      const updated: Category = {
        ...mockDb.categories[index],
        ...input,
        updatedAt: nowIso(),
      };
      mockDb.categories[index] = updated;

      for (const product of mockDb.products) {
        if (product.categoryId === id) {
          product.categoryName = updated.name;
        }
      }

      return withProductCount(updated);
    }

    return apiClient<Category>(`/categories/${id}`, { method: "PATCH", json: input });
  },

  /** DELETE /categories/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const hasProducts = mockDb.products.some((product) => product.categoryId === id);
      if (hasProducts) throw new Error("Move or delete the products in this category first.");
      mockDb.categories = mockDb.categories.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/categories/${id}`, { method: "DELETE" });
  },
};
