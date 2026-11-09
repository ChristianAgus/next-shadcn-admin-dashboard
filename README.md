# Store Admin — E-commerce Admin Boilerplate

A reusable e-commerce admin dashboard built with Next.js 16, React 19,
TypeScript, Tailwind CSS v4, and shadcn/ui. It ships with mock data, dummy
authentication, role-based access control, and an API-ready service layer so you
can replace the backend without rewriting the UI.

## Features

- **Config-driven branding** — app name, company details, metadata, navigation,
  breadcrumbs, currency, and locale come from config and environment variables.
- **Dummy auth + RBAC** — signed httpOnly session cookie, three demo roles,
  `resource:action` permissions, route guards, and a 403 page.
- **E-commerce dashboard** — revenue/order/customer metrics, a 12-month sales
  chart, category chart, recent orders, top products, low stock, new customers,
  and catalog summary.
- **Full CRUD modules** — products, categories, orders, customers, users, and
  roles with a permission matrix. Every module has search, filters, sorting,
  pagination, create/edit forms, detail dialogs, delete confirmation, toasts,
  loading skeletons, empty states, and error states.
- **Settings** — profile, store details, and appearance (theme mode + preset).
- **API-ready services** — every module checks `NEXT_PUBLIC_USE_MOCK_API` and
  switches between in-memory mocks and a typed `fetch` client.
- **Responsive shell** — collapsible sidebar, command-menu search, theme
  presets, layout controls, and dark mode.
- **Windows-friendly** — `.gitattributes`, `.editorconfig`, engine hints, and
  PowerShell commands throughout the docs.

## Tech stack

- Next.js 16 (App Router, React Compiler)
- React 19 + TypeScript strict mode
- Tailwind CSS v4 + shadcn/ui (`radix-nova`)
- Zod + React Hook Form
- TanStack Table v9
- Recharts
- Zustand (preferences)
- Biome (lint + format), Husky + lint-staged

## Requirements

- Node.js **20.9+** (verified on 22.19.0)
- npm **10+** (verified on 10.9.3)

The project only uses npm. There is no Yarn or pnpm lockfile.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
# Windows (PowerShell)
Copy-Item .env.example .env.local
# macOS / Linux
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>. The root route redirects to `/dashboard`, which
redirects to `/login` until you sign in.

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

## Demo accounts

| Role | Email | Password | Can do |
| --- | --- | --- | --- |
| Super Admin | `admin@example.com` | `admin123` | Everything |
| Manager | `manager@example.com` | `manager123` | Catalog, orders, customers, settings |
| Staff | `staff@example.com` | `staff123` | Read catalog/customers, update orders |

The login screen can fill any account with one click. Each role sees a different
sidebar because navigation is filtered by permissions.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run Biome lint. |
| `npm run check` | Run Biome checks. |
| `npm run check:fix` | Fix formatting and safe lint issues. |
| `npm run format` | Format files with Biome. |
| `npm run typecheck` | Run `tsc --noEmit`. |
| `npm run generate:presets` | Regenerate theme preset CSS. |

There is no automated test runner in the template yet. Add Vitest or Playwright
if your fork needs one.

## Environment variables

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for the full reference.
Required values:

```dotenv
NEXT_PUBLIC_APP_NAME="Store Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
NEXT_PUBLIC_USE_MOCK_API="true"
NEXT_PUBLIC_DEFAULT_LOCALE="en-US"
NEXT_PUBLIC_CURRENCY="USD"
AUTH_SECRET="replace-with-a-long-random-secret"
SESSION_COOKIE_NAME="store_admin_session"
SESSION_MAX_AGE="604800"
```

`.env.local` is ignored by Git; `.env.example` is committed.

## Project structure

```text
src/
├── app/
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   ├── _components/      # Header, sidebar, overview widgets
│   │   │   ├── categories/       # Route + colocated CRUD view
│   │   │   ├── customers/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── roles/
│   │   │   ├── settings/
│   │   │   ├── users/
│   │   │   ├── layout.tsx        # Session guard + shell
│   │   │   └── page.tsx          # Dashboard overview
│   │   ├── login/
│   │   └── unauthorized/         # 403 page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── data-table/               # DataTable, toolbar, pagination
│   ├── auth/                     # AuthProvider, Can, usePermission
│   ├── ui/                       # shadcn primitives (do not edit)
│   └── *.tsx                     # PageHeader, EmptyState, dialogs, etc.
├── config/                       # app, env, navigation, roles, demo
├── hooks/                        # useListQuery, useDebounce, useLogout
├── lib/                          # api client, auth, format, metadata
├── mocks/                        # In-memory seed data and mock handlers
├── services/                     # API-ready data layer
├── stores/                       # Preferences store
├── types/                        # Entity and API types
└── proxy.ts                      # Next.js 16 route protection
```

## Documentation

- [Configuration](docs/CONFIGURATION.md) — env vars, branding, navigation,
  currency, themes, metadata.
- [Auth and roles](docs/AUTH-AND-ROLES.md) — demo accounts, session cookie,
  permissions, route guards, 403.
- [Adding a module](docs/ADDING-A-MODULE.md) — the full CRUD checklist.
- [API integration](docs/API-INTEGRATION.md) — endpoint contracts and replacing
  mock data.
- [Docs index](docs/README.md)

## Customizing the boilerplate

1. Update `.env.local` with your product name, URL, locale, and currency.
2. Edit `APP_CONFIG.company` in `src/config/app.config.ts`.
3. Replace `src/components/app-logo.tsx` and `public/logo.svg` with your mark.
4. Update `src/config/navigation.config.ts` to add or remove modules.
5. Adjust roles and permissions in `src/config/roles.config.ts`.
6. Replace the mock data in `src/mocks/` or set `NEXT_PUBLIC_USE_MOCK_API=false`
   and connect your API.
7. Delete the demo credentials and demo-account panel before production.

## Windows notes

All commands have PowerShell variants in the docs. If you see CRLF churn in Git,
the committed `.gitattributes` normalizes text files. If script execution is
blocked, use `cmd.exe` or run `Set-ExecutionPolicy -Scope Process Bypass` in the
current PowerShell session.

## License

See [LICENSE](LICENSE).
