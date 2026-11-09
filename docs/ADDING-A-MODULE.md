# Adding a module

This checklist reproduces the structure used by products, categories, orders,
customers, users, and roles. Each module is a route folder with colocated pieces.

## 1. Define the types

Create `src/types/<entity>.ts` and export it from `src/types/index.ts`.

```ts
export interface Widget {
  id: string;
  name: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface WidgetInput {
  name: string;
  status: Widget["status"];
}
```

## 2. Add a mock module

Create `src/mocks/widgets.mock.ts` and export seed data. Then register the array in
`src/mocks/db.ts`:

```ts
import { seedWidgets } from "./widgets.mock";

export const mockDb = {
  // ...
  widgets: [...seedWidgets],
};
```

## 3. Add a service

Create `src/services/widget.service.ts` and follow the existing pattern: check
`env.NEXT_PUBLIC_USE_MOCK_API`, use `mockDelay` and `paginate` for mock mode, and
call `apiClient` for the real API. Document the endpoint above each method.

```ts
export const widgetService = {
  /** GET /widgets?page=&pageSize=&search=&status=&sortBy=&sortDir= */
  async list(params: ListParams = {}): Promise<PaginatedResponse<Widget>> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay();
      return paginate(applyFilters(params), params);
    }

    return apiClient<PaginatedResponse<Widget>>(`/widgets${toQueryString(params)}`);
  },

  /** POST /widgets */
  async create(input: WidgetInput): Promise<Widget> {
    // ...
  },

  /** PATCH /widgets/:id */
  async update(id: string, input: WidgetInput): Promise<Widget> {
    // ...
  },

  /** DELETE /widgets/:id */
  async remove(id: string): Promise<void> {
    // ...
  },
};
```

## 4. Add permissions

Add `widget:read`, `widget:create`, `widget:update`, and `widget:delete` to
`PERMISSIONS` in `src/config/roles.config.ts`, then grant them to the roles that
need them.

## 5. Add navigation

Add an item to `NAVIGATION` in `src/config/navigation.config.ts`:

```ts
{
  id: "widgets",
  title: "Widgets",
  description: "Manage storefront widgets.",
  url: "/dashboard/widgets",
  icon: Boxes,
  permission: "widget:read",
}
```

The sidebar, breadcrumbs, command menu, and page metadata pick it up
automatically.

## 6. Create the route

```text
src/app/(main)/dashboard/widgets/
├── page.tsx
└── _components/
    └── widgets-view.tsx
```

`page.tsx` stays a Server Component:

```tsx
import { requirePermission } from "@/lib/auth/session";
import { createMetadata } from "@/lib/metadata";

import { WidgetsView } from "./_components/widgets-view";

export const metadata = createMetadata({
  title: "Widgets",
  description: "Manage storefront widgets.",
  path: "/dashboard/widgets",
});

export default async function WidgetsPage() {
  await requirePermission("widget:read");
  return <WidgetsView />;
}
```

## 7. Build the client view

Copy the shape of `src/app/(main)/dashboard/products/_components/products-view.tsx`:

- `useListQuery` for debounced search, sorting, pagination, refresh, and errors.
- `ListToolbar` for search and filters.
- `DataTable` for rows, loading skeletons, empty state, and error state.
- `ListPagination` below the table.
- `FormDialog` for create/edit.
- `DetailDialog` for the read-only view.
- `ConfirmDialog` for delete.
- `usePermission()` to hide actions the role cannot perform.
- `toast.success()` / `toast.error()` from `sonner` for feedback.

Minimal skeleton:

```tsx
"use client";

const query = useListQuery<Widget>({
  fetcher: widgetService.list,
  initialSortBy: "createdAt",
  filters: { status: status === "all" ? undefined : status },
});

<DataTable
  columns={columns}
  data={query.rows}
  getRowId={(row) => row.id}
  isLoading={query.isLoading}
  error={query.error}
  onRetry={query.refresh}
  sortBy={query.sortBy}
  sortDir={query.sortDir}
  onSort={query.toggleSort}
  emptyTitle="No widgets found"
/>
```

## 8. Reusable components

| Component | Location | Purpose |
| --- | --- | --- |
| `PageHeader` | `src/components/page-header.tsx` | Title, description, and actions. |
| `EmptyState` | `src/components/empty-state.tsx` | Icon, title, description, and CTA. |
| `DataTable` | `src/components/data-table/data-table.tsx` | Table, sorting, skeleton, empty, and error states. |
| `ListToolbar` | `src/components/data-table/list-toolbar.tsx` | Search input and filter slot. |
| `ListPagination` | `src/components/data-table/list-pagination.tsx` | Range text and previous/next controls. |
| `FormDialog` | `src/components/form-dialog.tsx` | Dialog with a form and submit state. |
| `ConfirmDialog` | `src/components/confirm-dialog.tsx` | Destructive confirmation. |
| `DetailDialog` | `src/components/detail-dialog.tsx` | Read-only entity details. |
| `FormField` | `src/components/form-field.tsx` | Label, control, hint, and error. |
| `StatusBadge` | `src/components/status-badge.tsx` | Consistent status colors. |

## 9. States to handle

Before opening a pull request, verify:

- Loading skeletons
- Empty results
- API/service errors with retry
- Disabled actions while a mutation is pending
- Permission-gated buttons
- Delete confirmation
- Success and error toasts
- Mobile overflow and table scrolling
- Dark mode and each theme preset

## 10. Validate

```bash
npm run check:fix
npm run lint
npm run typecheck
npm run build
```

The project intentionally has no automated test runner yet. Add Vitest or
Playwright if your fork needs one.
