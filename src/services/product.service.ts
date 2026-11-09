import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { ListParams, PaginatedResponse } from "@/types/common";
import type { Product, ProductInput } from "@/types/product";

function applyFilters(params: ListParams) {
  const status = params.filters?.status;
  const categoryId = params.filters?.categoryId;

  const filtered = mockDb.products.filter((product) => {
    const matchesStatus = !status || product.status === status;
    const matchesCategory = !categoryId || product.categoryId === categoryId;
    const matches = matchesSearch(params.search, [product.name, product.sku, product.categoryName]);
    return matchesStatus && matchesCategory && matches;
  });

  return sortItems(filtered, params.sortBy, params.sortDir, (product, key) => {
    if (key === "price") return product.price;
    if (key === "stock") return product.stock;
    if (key === "sold") return product.sold;
    if (key === "name") return product.name;
    return product.createdAt;
  });
}

export const productService = {
  /** GET /products?page=&pageSize=&search=&status=&categoryId=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Product>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Product>>(`/products${toQueryString(params)}`);
  },

  /** GET /products/:id */
  async getById(id: string): Promise<Product> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      const product = mockDb.products.find((item) => item.id === id);
      if (!product) throw new Error("Product not found.");
      return product;
    }

    return apiClient<Product>(`/products/${id}`);
  },

  /** POST /products */
  async create(input: ProductInput): Promise<Product> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const category = mockDb.categories.find((item) => item.id === input.categoryId);
      const timestamp = nowIso();
      const product: Product = {
        ...input,
        id: makeId("prd"),
        categoryName: category?.name ?? "Uncategorized",
        sold: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.products.unshift(product);
      return product;
    }

    return apiClient<Product>("/products", { method: "POST", json: input });
  },

  /** PATCH /products/:id */
  async update(id: string, input: ProductInput): Promise<Product> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.products.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Product not found.");

      const category = mockDb.categories.find((item) => item.id === input.categoryId);
      const updated: Product = {
        ...mockDb.products[index],
        ...input,
        categoryName: category?.name ?? "Uncategorized",
        updatedAt: nowIso(),
      };
      mockDb.products[index] = updated;
      return updated;
    }

    return apiClient<Product>(`/products/${id}`, { method: "PATCH", json: input });
  },

  /** DELETE /products/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      mockDb.products = mockDb.products.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/products/${id}`, { method: "DELETE" });
  },
};
