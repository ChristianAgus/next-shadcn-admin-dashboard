export type AdminUserStatus = "active" | "invited" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  status: AdminUserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserInput {
  name: string;
  email: string;
  roleId: string;
  status: AdminUserStatus;
  avatar?: string;
}
