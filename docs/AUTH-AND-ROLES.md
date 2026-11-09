# Authentication and roles

The boilerplate ships with dummy authentication and role-based access control
(RBAC). There is no database: users, sessions, and permissions are generated from
config and mock data. The structure is designed to be swapped for a real backend
without rewriting the UI.

## Demo accounts

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Super Admin | `admin@example.com` | `admin123` | Everything, including users, roles, and settings. |
| Manager | `manager@example.com` | `manager123` | Catalog, orders, customers, and settings. |
| Staff | `staff@example.com` | `staff123` | Read catalog and customers, update orders, edit own profile. |

The login screen can fill these credentials with one click. Demo credentials live
in `src/mocks/auth.mock.ts` and `src/config/demo.config.ts`. Remove both before
shipping a production build.

## Sign-in flow

1. `src/app/(main)/login/_components/login-form.tsx` validates the form with Zod
   and calls the `loginAction` server action.
2. `src/server/auth-actions.ts` calls `authService.login()`.
3. In mock mode, `authenticateMock()` checks the demo password and resolves the
   role permissions from `src/config/roles.config.ts`.
4. The action signs a session token with HMAC-SHA-256 using `AUTH_SECRET`.
5. The token is written to an httpOnly, same-site cookie named by
   `SESSION_COOKIE_NAME` with `SESSION_MAX_AGE`.

The token contains `{ user, expiresAt }`. `src/lib/auth/session-token.ts` uses the
Web Crypto API, so it works in both Node.js and edge runtimes.

## Session helpers

```ts
import { getSession, requireSession, requirePermission } from "@/lib/auth/session";

const session = await getSession();          // Session | null
const session = await requireSession();      // Redirects to /login when missing
const session = await requirePermission("product:create"); // Redirects to /unauthorized
```

Use `requirePermission()` in server pages and server actions. The sidebar also
filters itself using `getNavigationForUser()`.

## Route protection

Next.js 16 renamed Middleware to Proxy. `src/proxy.ts` is the equivalent of
`middleware.ts` and:

- Redirects unauthenticated requests for `/dashboard/**` to `/login?from=...`.
- Redirects signed-in users away from `/login`.
- Verifies the signed cookie before allowing access.

The proxy is a fast first line of defense. Page-level `requirePermission()` calls
are still required because permissions can differ per module.

## Permissions

Permissions use the `resource:action` format:

```ts
"product:read" | "product:create" | "product:update" | "product:delete" | ...
```

They are declared in `src/config/roles.config.ts`:

```ts
export const PERMISSIONS = [
  { id: "product:read", group: "Products", label: "View products", resource: "product", action: "read" },
  // ...
] as const;
```

Add a permission to a role by editing `ROLES`. Built-in roles are:

- `super-admin` — all permissions
- `manager` — catalog, orders, customers, settings
- `staff` — read catalog/customers and update orders

The mock database also contains two custom roles, `catalog-editor` and `support`,
so the roles screen has editable examples.

## Checking permissions

Server code:

```ts
import { can } from "@/lib/auth/permissions";

if (!can(session.user, "product:update")) {
  redirect("/unauthorized?permission=product%3Aupdate");
}
```

Client code:

```tsx
import { Can, usePermission } from "@/components/auth/auth-provider";

const { can, hasRole } = usePermission();

{can("product:create") ? <Button>New product</Button> : null}
{hasRole("super-admin") ? <AdminPanel /> : null}
{can(["order:update", "order:create"]) ? <OrderActions /> : null}

<Can permission="role:update" fallback={<ReadOnlyMatrix />}>
  <RoleEditor />
</Can>
```

`can()` accepts a single permission or an array. Arrays use **any-of** semantics.

## 403 page

`src/app/(main)/unauthorized/page.tsx` is the access-denied screen. Permission
guards redirect there with a `permission` query parameter so the user can see what
is missing. The page offers a route back to the dashboard or settings.

## Using a real backend

1. Set `NEXT_PUBLIC_USE_MOCK_API=false`.
2. Implement `POST /auth/login`, `POST /auth/logout`, and a current-session
   endpoint on your API.
3. Keep the signed cookie strategy, or replace `src/lib/auth/session.ts` with a
   call to your session endpoint.
4. Map your backend roles to the permission strings in `roles.config.ts`, or
   replace the role registry with the permissions returned by the API.
5. Keep `requirePermission()` in pages: it is the authoritative UI guard.
