# SalonMind Repository Structure

> Snapshot generated March 2026 – mirrors the new multi-app layout (dashboard + employee app + API service).

## Root Layout

```
salonmind/
├── README.md                # High-level introduction & quick start
├── PROJECT_STRUCTURE.md     # ← this file
├── apps/                    # All front-end workspaces
├── salonmind-services/      # Backend/API services
├── packages/                # Shared libraries/tooling (placeholders)
└── docs/                    # Centralized documentation
```

### `apps/` Workspaces

| Path | Description |
| ---- | ----------- |
| `apps/salonmind-tenant-dashboard/` | Production-ready salon owner (tenant) dashboard built with React 18 + Vite; includes OTP auth, onboarding, and live dashboard modules. |
| `apps/salonmind-people/` | Employee/mobile experience scaffold (React + Capacitor) that will eventually replace the legacy employee app. |
| `apps/salonmind-dashboard/` | Placeholder for the internal admin console. |
| `apps/employee-app/` | Legacy employee workspace README; kept for documentation/history. |
| `apps/salonmind/` | Placeholder for the marketing/landing site.

#### `apps/salonmind-tenant-dashboard/`

```
apps/salonmind-tenant-dashboard/
├── README.md
├── package.json
├── vite.config.ts
├── playwright.config.ts
├── src/
│   ├── App.tsx             # Lazy-routed Login → Onboarding → Dashboard flow
│   ├── pages/              # All screen-level views (Dashboard, Appointments, Staff, Services, Clients, etc.)
│   ├── components/         # Purely reusable UI primitives (cards, dialogs, inputs, etc.)
│   │   ├── ui/             # shadcn/Radix-based UI primitives
│   │   └── figma/          # Support components (ImageWithFallback)
│   ├── contexts/           # AuthContext with OTP/login helpers
│   ├── services/           # Axios client + auth/owner API abstractions (`services/owner/*`)
│   ├── constants/          # API routes + storage keys
│   ├── hooks/              # React Query hooks (e.g., `hooks/owner/*`, `useDebouncedValue`)
│   ├── styles/             # Tailwind/global styles
│   ├── types/              # Shared TypeScript definitions
│   └── utils/              # Logger + helpers
├── tests/                  # Playwright e2e suites + fixtures
├── build/                  # Production build output
├── test-results/           # Playwright artifacts
└── playwright-report/      # HTML reports
```

Key entry points:
- `src/main.tsx` mounts the app with the `AuthProvider`.
- `src/pages/Dashboard.tsx` lazy-loads view modules (overview, appointments, staff, services, etc.).
- `src/pages/Login.tsx` handles OTP login with validation consistent with the backend.
- `tests/e2e/*.spec.ts` cover login/onboarding happy paths using Playwright.

#### `apps/salonmind-people/`

Vite + Capacitor scaffold for the employee/mobile app. It mirrors the owner dashboard’s tooling (React Query, shared auth client) but still lacks feature pages.

#### `apps/employee-app/`

Historical README + planning notes that describe the earlier employee experience. Keep it around until all documents move into `apps/salonmind-people`.

#### `apps/salonmind-dashboard/` & `apps/salonmind/`

Placeholders so routing/tooling can reference the admin console and landing site when their implementations land.

### `salonmind-services/` Workspaces

| Path | Description |
| ---- | ----------- |
| `salonmind-services/salonmind-apis/` | Node.js + Express REST API that powers authentication, onboarding, and salon management. |

#### `salonmind-services/salonmind-apis/`

```
salonmind-services/salonmind-apis/
├── README.md
├── package.json
├── SalonMind_API_Collection.postman_collection.json
└── src/
    ├── server.js               # Express bootstrap (CORS, routes, health check)
    ├── config/                 # Mongo connection + constants
    ├── controllers/            # Auth + salon controllers (OTP, onboarding, CRUD)
    ├── middleware/             # JWT auth, role guards, error handling, request logging
    ├── models/                 # Mongoose schemas (User, Salon, Appointments, etc.)
    ├── routes/                 # `/api/auth`, `/api/salons`, …
    ├── services/               # (Reserved for future business logic helpers)
    ├── utils/                  # Logger, ApiError, async handler
    └── scripts/                # Seed scripts / automation
```

Important files:
- `src/controllers/authController.js` – handles email/password login, OTP verification, onboarding flows, and profile updates.
- `src/controllers/salonsController.js` – owner/manager CRUD with role checks.
- `src/middleware/auth.js` & `src/middleware/roleCheck.js` – JWT parsing + RBAC helpers.
- `src/models/*.js` – domain models for users, salons, appointments, services, products, etc.

### `packages/` Workspaces

Scaffolds that will eventually hold shared logic:

| Path | Purpose |
| ---- | ------- |
| `packages/ui/` | Component library extraction point. |
| `packages/config/` | Shared ESLint/Tailwind/tsconfig presets. |
| `packages/utils/` | Cross-project helpers. |
| `packages/auth/` | Auth/session helpers. |
| `packages/ai/` | AI integrations, prompt packs, etc. |

## How to Navigate

1. **Dashboards (`apps/salonmind-tenant-dashboard`)** – work on salon-owner UI, tests, and shared UI primitives.
2. **Employee app (`apps/employee-app`)** – bootstrap this workspace and port the CleanMyCar employee auth flow here.
3. **API (`salonmind-services/salonmind-apis`)** – add/modify Express endpoints, models, or middleware; keep README/.env guides updated alongside controller changes.
4. **Packages (`packages/*`)** – populate shared tooling/helpers as code is extracted.

Each workspace is self-contained with its own `README.md`, `package.json`, and tooling configuration. Use the root README for quick-start commands and this document whenever you need a structural overview.
