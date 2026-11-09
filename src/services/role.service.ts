import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { ListParams, PaginatedResponse } from "@/types/common";
import type { Role, RoleInput } from "@/types/role";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function applyFilters(params: ListParams) {
  const filtered = mockDb.roles.filter((role) => matchesSearch(params.search, [role.name, role.description]));
  return sortItems(filtered, params.sortBy, params.sortDir, (role, key) => {
    if (key === "userCount") return role.userCount;
    if (key === "name") return role.name;
    return role.createdAt;
  });
}

function findRole(id: string) {
  const role = mockDb.roles.find((item) => item.id === id);
  if (!role) throw new Error("Role not found.");
  return role;
}

export const roleService = {
  /** GET /roles?page=&pageSize=&search=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Role>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Role>>(`/roles${toQueryString(params)}`);
  },

  /** GET /roles/:id */
  async getById(id: string): Promise<Role> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      return findRole(id);
    }

    return apiClient<Role>(`/roles/${id}`);
  },

  /** POST /roles */
  async create(input: RoleInput): Promise<Role> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const id = slugify(input.name) || makeId("role");
      const duplicate = mockDb.roles.some((role) => role.id === id || role.name === input.name);
      if (duplicate) throw new Error("A role with this name already exists.");

      const timestamp = nowIso();
      const role: Role = {
        ...input,
        id,
        isSystem: false,
        userCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.roles.push(role);
      return role;
    }

    return apiClient<Role>("/roles", { method: "POST", json: input });
  },

  /** PATCH /roles/:id */
  async update(id: string, input: RoleInput): Promise<Role> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.roles.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Role not found.");

      const updated: Role = {
        ...mockDb.roles[index],
        ...input,
        updatedAt: nowIso(),
      };
      mockDb.roles[index] = updated;
      return updated;
    }

    return apiClient<Role>(`/roles/${id}`, { method: "PATCH", json: input });
  },

  /** DELETE /roles/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const role = findRole(id);
      if (role.isSystem) throw new Error("System roles cannot be deleted.");
      mockDb.roles = mockDb.roles.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/roles/${id}`, { method: "DELETE" });
  },
};
