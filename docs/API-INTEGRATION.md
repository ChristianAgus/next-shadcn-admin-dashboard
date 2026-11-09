# API integration

Every module already has a service layer with the exact shape a real backend
needs. Mock mode is controlled by a single environment variable.

## Switch modes

```dotenv
# In-memory mock data
NEXT_PUBLIC_USE_MOCK_API="true"

# Real backend
NEXT_PUBLIC_USE_MOCK_API="false"
NEXT_PUBLIC_API_BASE_URL="https://api.your-store.com"
```

## Service contract

Each service follows this pattern:

```ts
async list(params: ListParams): Promise<PaginatedResponse<T>>
async getById(id: string): Promise<T>
async create(input: TInput): Promise<T>
async update(id: string, input: TInput): Promise<T>
async remove(id: string): Promise<void>
```

List endpoints return:

```json
{
  "data": [],
  "total": 120,
  "page": 1,
  "pageSize": 10,
  "totalPages": 12
}
```

List query parameters:

| Parameter | Meaning |
| --- | --- |
| `page` | 1-based page number. |
| `pageSize` | Rows per page. |
| `search` | Free-text search. |
| `sortBy` | Field id from the table column. |
| `sortDir` | `asc` or `desc`. |
| `status`, `categoryId`, `roleId` | Module-specific filters. |

## Endpoint map

| Service | Endpoints |
| --- | --- |
| `authService` | `POST /auth/login`, `POST /auth/logout` |
| `dashboardService` | `GET /dashboard/overview` |
| `productService` | `GET/POST /products`, `GET/PATCH/DELETE /products/:id` |
| `categoryService` | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| `orderService` | `GET/POST /orders`, `GET/PATCH/DELETE /orders/:id`, `PATCH /orders/:id/status` |
| `customerService` | `GET/POST /customers`, `GET/PATCH/DELETE /customers/:id` |
| `userService` | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| `roleService` | `GET/POST /roles`, `GET/PATCH/DELETE /roles/:id` |
| `settingsService` | `GET /settings`, `PATCH /settings/profile`, `PATCH /settings/store`, `POST /settings/change-password` |

## HTTP client

`src/lib/api/client.ts` provides `apiClient<T>()`:

- Prepends `NEXT_PUBLIC_API_BASE_URL`
- Serializes JSON bodies
- Sends cookies with `credentials: "include"`
- Adds `Authorization: Bearer <token>` when a token is supplied
- Throws `ApiError` with `status`, `code`, and `details`
- Uses `cache: "no-store"` by default

```ts
const product = await apiClient<Product>("/products/prd-1", {
  method: "PATCH",
  json: input,
  token: accessToken,
});
```

Expected error body:

```json
{
  "message": "Product not found.",
  "code": "PRODUCT_NOT_FOUND",
  "details": {}
}
```

## Mutations and cache refresh

Mock mutations change the in-memory database, so list screens call
`query.refresh()` after every successful create, update, or delete. With a real
API, the same call refetches the current page. For richer caching, replace
`useListQuery` with TanStack Query or SWR; the service signatures do not change.

## Authentication

Two integration options:

1. **Keep the signed cookie.** Your API validates the same cookie or returns a
   session payload that `src/lib/auth/session.ts` verifies.
2. **Use bearer tokens.** Return a token from `POST /auth/login`, store it in an
   httpOnly cookie on the server, and pass it to `apiClient` when needed.

Never expose long-lived secrets through `NEXT_PUBLIC_*` variables. Those values
are bundled into the browser build.

## Server Actions

`src/server/auth-actions.ts` contains server actions for login, logout, and
profile updates. When you add API-backed mutations, prefer Server Actions for
operations that touch cookies or server-only secrets, and keep client forms thin.

## Replacing mock settings

`settingsService` currently persists profile and store settings in
`localStorage`. Replace `readStorage` / `writeStorage` with real endpoints while
keeping the `SettingsBundle` return type. The settings UI needs no changes beyond
additional loading and error handling if your API is slow.

## Removing demo data

Before shipping:

1. Delete `src/mocks/` or keep it behind `NEXT_PUBLIC_USE_MOCK_API`.
2. Remove demo credentials from `src/mocks/auth.mock.ts` and
   `src/config/demo.config.ts`.
3. Remove the demo-account panel from the login form.
4. Set a strong `AUTH_SECRET`.
5. Set `NEXT_PUBLIC_USE_MOCK_API=false`.
6. Review `robots.ts` and `sitemap.ts` for your production domain.
