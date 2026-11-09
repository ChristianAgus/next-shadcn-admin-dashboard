import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";
import { mockDb } from "@/mocks/db";
import { makeId, matchesSearch, mockDelay, nowIso, paginate, sortItems } from "@/mocks/utils";
import type { ListParams, PaginatedResponse } from "@/types/common";
import type { AdminUser, AdminUserInput } from "@/types/user";

function getRoleName(roleId: string) {
  return mockDb.roles.find((role) => role.id === roleId)?.name ?? roleId;
}

function applyFilters(params: ListParams) {
  const roleId = params.filters?.roleId;
  const status = params.filters?.status;
  const filtered = mockDb.users.filter((user) => {
    const matchesRole = !roleId || user.roleId === roleId;
    const matchesStatus = !status || user.status === status;
    return matchesRole && matchesStatus && matchesSearch(params.search, [user.name, user.email, user.roleName]);
  });

  return sortItems(filtered, params.sortBy, params.sortDir, (user, key) => {
    if (key === "name") return user.name;
    if (key === "roleName") return user.roleName;
    if (key === "lastLoginAt") return user.lastLoginAt ?? "";
    return user.createdAt;
  });
}

function findUser(id: string) {
  const user = mockDb.users.find((item) => item.id === id);
  if (!user) throw new Error("User not found.");
  return user;
}

export const userService = {
  /** GET /users?page=&pageSize=&search=&roleId=&status=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<AdminUser>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<AdminUser>>(`/users${toQueryString(params)}`);
  },

  /** GET /users/:id */
  async getById(id: string): Promise<AdminUser> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(180);
      return findUser(id);
    }

    return apiClient<AdminUser>(`/users/${id}`);
  },

  /** POST /users */
  async create(input: AdminUserInput): Promise<AdminUser> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const duplicate = mockDb.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
      if (duplicate) throw new Error("A user with this email already exists.");

      const timestamp = nowIso();
      const user: AdminUser = {
        ...input,
        id: makeId("usr"),
        roleName: getRoleName(input.roleId),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      mockDb.users.unshift(user);
      return user;
    }

    return apiClient<AdminUser>("/users", { method: "POST", json: input });
  },

  /** PATCH /users/:id */
  async update(id: string, input: AdminUserInput): Promise<AdminUser> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const index = mockDb.users.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("User not found.");

      const updated: AdminUser = {
        ...mockDb.users[index],
        ...input,
        roleName: getRoleName(input.roleId),
        updatedAt: nowIso(),
      };
      mockDb.users[index] = updated;
      return updated;
    }

    return apiClient<AdminUser>(`/users/${id}`, { method: "PATCH", json: input });
  },

  /** DELETE /users/:id */
  async remove(id: string): Promise<void> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      const user = findUser(id);
      if (user.roleId === "super-admin") {
        throw new Error("The last Super Admin cannot be deleted.");
      }
      mockDb.users = mockDb.users.filter((item) => item.id !== id);
      return;
    }

    await apiClient<void>(`/users/${id}`, { method: "DELETE" });
  },
};
