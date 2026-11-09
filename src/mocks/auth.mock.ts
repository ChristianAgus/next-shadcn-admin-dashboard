import { getPermissionsForRole, getRoleDefinition } from "@/config/roles.config";
import type { LoginInput, LoginResult } from "@/types/auth";

import { seedAdminUsers } from "./users.mock";
import { mockDelay } from "./utils";

/** Demo-only credentials. Never ship these accounts in a production build. */
const MOCK_PASSWORDS: Record<string, string> = {
  "admin@example.com": "admin123",
  "manager@example.com": "manager123",
  "staff@example.com": "staff123",
};

export async function authenticateMock(input: LoginInput): Promise<LoginResult> {
  await mockDelay(450);

  const email = input.email.trim().toLowerCase();
  const user = seedAdminUsers.find((candidate) => candidate.email === email);
  const expectedPassword = MOCK_PASSWORDS[email];

  if (!user || !expectedPassword || expectedPassword !== input.password) {
    return { ok: false, error: "Invalid email or password. Use one of the demo accounts listed below." };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "This account has been suspended. Contact a Super Admin." };
  }

  const role = getRoleDefinition(user.roleId);

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      roleId: user.roleId,
      roleName: role?.name ?? user.roleName,
      permissions: getPermissionsForRole(user.roleId),
    },
  };
}
