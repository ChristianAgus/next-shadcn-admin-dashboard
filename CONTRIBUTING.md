# Contributing to Store Admin

Thanks for your interest in improving **Store Admin**, a reusable e-commerce
admin boilerplate. This guide explains how to set up the project and how to
contribute changes that fit the existing architecture.

---

## Overview

This project is built with **Next.js 16**, **React 19**, **TypeScript**,
**Tailwind CSS v4**, and **shadcn/ui** (Radix UI primitives, `radix-nova` style).
The goal is to keep the codebase modular, config-driven, and easy to extend into
a real product.

---

## Project Layout

Feature code is colocated with the route that owns it.

```
src
├── app
│   ├── (main)
│   │   ├── dashboard
│   │   │   ├── <module>          # products, categories, orders, etc.
│   │   │   │   ├── _components
│   │   │   │   └── page.tsx
│   │   │   └── _components       # shared dashboard shell widgets
│   │   ├── login
│   │   └── unauthorized
│   └── layout.tsx
├── components                    # shared UI and data-table primitives
├── config                        # app, navigation, roles, and env config
├── hooks                         # reusable hooks
├── lib                           # auth, formatting, metadata, utilities
├── mocks                         # in-memory mock database
├── services                      # API-ready data layer
├── styles                        # Tailwind and theme presets
└── types                         # TypeScript definitions
```

Keep a component inside its route until another feature needs it. Do not move
screen-specific code into a shared directory preemptively.

---

## Getting Started

### Fork and Clone the Repository

1. Fork the repository on your Git host.
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   ```

3. Navigate into the project:

   ```bash
   cd YOUR_REPO
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Copy the environment template and adjust the values:

   ```powershell
   Copy-Item .env.example .env.local
   ```

6. Run the dev server:

   ```bash
   npm run dev
   ```

   The app is available at [http://localhost:3000](http://localhost:3000). If
   the port is busy, run `npm run dev -- -p 3001`.

See [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) for every environment
variable and configuration file.

---

## Contribution Flow

- Create a new branch before working on changes:

  ```bash
  git checkout -b feature/my-update
  ```

- Use clear conventional commit messages:

  ```bash
  git commit -m "feat: add suppliers module"
  ```

- Run the local checks before opening a pull request:

  ```bash
  npm run check
  npm run typecheck
  ```

- Open a pull request once ready. Include screenshots for new screens or
  material visual changes, and mention mobile and dark-theme states when
  relevant.

---

## Where to Contribute

- **Dashboard modules**: `src/app/(main)/dashboard/<module>/`
- **Dashboard shell and shared widgets**: `src/app/(main)/dashboard/_components/`
- **Shared components**: `src/components/`
- **Auth and session logic**: `src/lib/auth/` and `src/server/`
- **Data layer**: `src/services/` and `src/mocks/`
- **Configuration**: `src/config/`
- **Documentation**: `docs/`
- **Themes**: presets under `src/styles/presets/`

When adding a module, follow [`docs/ADDING-A-MODULE.md`](docs/ADDING-A-MODULE.md).

---

## Guidelines

- Prefer **TypeScript types** over `any`.
- Husky pre-commit hooks run Biome. Fix lint and format errors before committing.
- Follow the existing shadcn/ui and Tailwind v4 conventions.
- Do not modify files inside `src/components/ui/` or `src/components/calendar/`.
  Apply customization where the components are used.
- Use semantic theme tokens instead of raw color values so light mode, dark mode,
  and presets keep working.
- Keep accessibility in mind (semantic HTML, labels, ARIA, keyboard navigation).
- Avoid unnecessary dependencies. Prefer existing utilities.
- Keep changes focused and avoid refactoring unrelated files.

---

## Submitting PRs

- Open a pull request once your changes are ready.
- Ensure your branch is up to date with `main` before submitting.
- Reference any related issue in your PR for context.
- Explain any new reusable pattern or dependency in the PR description.

---

## Questions and Support

Open an issue in the repository for bugs, suggestions, or questions.
