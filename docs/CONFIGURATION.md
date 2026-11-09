# Configuration

All branding and runtime configuration is centralized. Components read from
config instead of hardcoding product names, links, menu labels, or currency.

## Environment variables

Copy the template and adjust the values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Yes | Product name used in metadata, sidebar, login screen, and copyright. |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL. Used for metadata, sitemap, and Open Graph URLs. |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL for the future backend. |
| `NEXT_PUBLIC_USE_MOCK_API` | Yes | `true` uses in-memory mocks; `false` calls the real API. |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Yes | Intl locale, for example `en-US` or `id-ID`. |
| `NEXT_PUBLIC_CURRENCY` | Yes | ISO currency code, for example `USD` or `IDR`. |
| `AUTH_SECRET` | Yes | HMAC secret for signing session tokens. Minimum 16 characters. |
| `SESSION_COOKIE_NAME` | Yes | Name of the httpOnly session cookie. |
| `SESSION_MAX_AGE` | Yes | Session lifetime in seconds. Defaults to 7 days. |

`.env.local` is ignored by Git. `.env.example` is committed.

Validation lives in `src/config/env.ts` and uses Zod. Invalid values throw at
startup with a readable list of problems. Public and server-only schemas are
kept separate so secrets never enter the browser bundle.

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Application config

`src/config/app.config.ts` derives the rest of the brand from the environment:

- `APP_CONFIG.name`, `shortName`, `title`, and `description`
- `APP_CONFIG.company` (email, phone, address)
- `APP_CONFIG.copyright`
- `APP_CONFIG.logo` and `APP_CONFIG.favicon`
- `APP_CONFIG.locale`, `language`, and `currency`
- `APP_CONFIG.links.website` and `APP_CONFIG.links.support`

`src/config/app-config.ts` re-exports it for imports that prefer the shorter
path. Update `APP_CONFIG.company` when you fork the boilerplate.

## Navigation

`src/config/navigation.config.ts` is the single source of truth for:

- Sidebar groups and items
- Item icons, badges, disabled state, and external links
- Per-item `permission` requirements
- Breadcrumb labels
- Command-menu search entries
- Page titles used by `createMetadata`

Useful helpers:

```ts
import { findNavigationTrail, getNavigationForUser, getPageMeta } from "@/config/navigation.config";

const visibleGroups = getNavigationForUser(session.user);
const trail = findNavigationTrail("/dashboard/products");
const page = getPageMeta("/dashboard/products");
```

The sidebar, breadcrumbs, and search dialog all consume the filtered tree, so a
new navigation entry automatically appears in all three places.

## Roles and permissions

`src/config/roles.config.ts` defines:

- `PERMISSIONS` — the canonical `resource:action` list
- `ROLES` — the built-in `super-admin`, `manager`, and `staff` roles
- `getPermissionsForRole(roleId)` and `isPermission(value)` helpers

See [AUTH-AND-ROLES.md](./AUTH-AND-ROLES.md) for the full flow.

## Currency and dates

Use the helpers in `src/lib/format.ts`:

```ts
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";
```

They read `APP_CONFIG.locale` and `APP_CONFIG.currency`, so changing the two
environment variables updates the whole UI.

## Theme and layout preferences

Theme presets, theme mode, fonts, sidebar layout, and content width are managed
by the preferences store in `src/stores/preferences/`. Preset definitions live in
`src/lib/preferences/theme.ts`; generated CSS presets live in
`src/styles/presets/`.

To add a preset:

1. Add its CSS variables in `src/styles/presets/<name>.css`.
2. Register it in the preset generator or theme registry.
3. Run `npm run generate:presets`.
4. Select it from **Settings → Appearance** or the header preferences button.

The default theme is applied before hydration by `src/scripts/theme-boot.tsx`,
so there is no flash of the wrong theme.

## Metadata

Every page calls `createMetadata()` from `src/lib/metadata.ts`:

```ts
export const metadata = createMetadata({
  title: "Products",
  description: "Manage catalog products.",
  path: "/dashboard/products",
});
```

The root layout appends `| APP_CONFIG.name` through the Next.js title template.
