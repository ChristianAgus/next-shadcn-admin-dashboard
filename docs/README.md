# Documentation

This folder documents the reusable e-commerce admin boilerplate. Start with the
root [`README.md`](../README.md) for setup, then use these guides for deeper
customization.

| Guide | What it covers |
| --- | --- |
| [CONFIGURATION.md](./CONFIGURATION.md) | Environment variables, branding, navigation, currency, and theme config. |
| [AUTH-AND-ROLES.md](./AUTH-AND-ROLES.md) | Demo accounts, session cookies, permissions, route guards, and the 403 page. |
| [ADDING-A-MODULE.md](./ADDING-A-MODULE.md) | End-to-end checklist for adding a new CRUD screen. |
| [API-INTEGRATION.md](./API-INTEGRATION.md) | Replacing mock data with a real backend, endpoint contracts, and auth headers. |

## Conventions

- Feature code lives next to the route that owns it, under `_components/`.
- Cross-screen primitives live in `src/components/`.
- Every list screen uses the same building blocks: `PageHeader`, `ListToolbar`,
  `DataTable`, `ListPagination`, `FormDialog`, `ConfirmDialog`, and
  `DetailDialog`.
- Every data module has a service in `src/services/` and a mock module in
  `src/mocks/`.
- Permissions are always `resource:action` strings declared in
  `src/config/roles.config.ts`.

## Platform notes

The project is verified on Node.js 22.19.0 and npm 10.9.3. The
`engines` field accepts Node.js 20.9+ because that is the minimum supported by
Next.js 16. If your environment provides a newer Node.js release, it will work as
well. All commands in this documentation include Windows-friendly variants.
