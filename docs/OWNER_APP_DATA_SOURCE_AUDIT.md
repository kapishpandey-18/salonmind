# SalonMind Owner App – Data Source Audit

## Snapshot
- Real APIs now power onboarding, tenant context, branch activation, and the dashboard’s Appointments, Clients, Staff, and Services modules (all wired through React Query). Overview, Products, Inventory, Revenue, Profile/Settings, and Help continue to render local mock data.
- Backend coverage: `/v1/owner/onboarding/*`, `/v1/owner/me/context`, `/v1/owner/branches`, `/v1/owner/branches/active`, `/v1/owner/{staff|services|clients|appointments}` (all defined under `salonmind-services/salonmind-apis/src/modules/owner`). Inventory/products/revenue endpoints still do not exist.
- Auth/session handling stays OTP-only with tokens persisted under `auth_token`, `refresh_token`, and `user_data`. The axios client includes `Authorization` + `X-Branch-Id`, refreshes tokens once per 401, and clears React Query cache + storage when refresh fails.

## Module Findings (apps/salonmind-tenant-dashboard)
Each entry covers key UI fields, prominent actions, the current data source, and code evidence.

### Dashboard Shell & Tenant Context (`apps/salonmind-tenant-dashboard/src/pages/Dashboard.tsx`)
- **Fields:** salon name/logo + subscription badge + branch selector header (`Dashboard.tsx:148-374`).
- **Actions:** switch between Overview/Appointments/etc; select active branch (persists to `localStorage` and server) via `useSetActiveBranch` (`apps/salonmind-tenant-dashboard/src/queries/useSetActiveBranch.ts`). Successful mutations invalidate `["tenant-context"]`.
- **Data source:** ✅ REAL API — inline `useQuery` calls `ownerService.getTenantContext` (`apps/salonmind-tenant-dashboard/src/services/ownerService.ts:33-43`) → `GET /v1/owner/me/context` (`salonmind-services/salonmind-apis/src/modules/owner/routes/owner.routes.js:6-9` → `owner.controller.js:5-12`). Branch selections post to `POST /v1/owner/branches/active` (`branches.routes.js:21-24`) via `ownerService.setActiveBranch`.
- **Notes:** Axios now injects `X-Branch-Id` from `STORAGE_KEYS.ACTIVE_BRANCH_ID`, and the context endpoint falls back gracefully when the header is missing/invalid.

### Overview (`apps/salonmind-tenant-dashboard/src/pages/Overview.tsx`)
- **Fields:** KPI cards (revenue, appointments, clients, rating) and charts for revenue/service mix/week schedule (lines `Overview.tsx:44-326`).
- **Actions:** purely informational; charts read constants.
- **Data source:** ❌ MOCK ONLY — `revenueData`, `serviceData`, `appointmentData`, and `upcomingAppointments` are hard-coded arrays (`Overview.tsx:6-40`). No API calls or hooks are referenced.

### Appointments (`apps/salonmind-tenant-dashboard/src/pages/Appointments.tsx`)
- **Fields:** calendar filters, appointment list, stats cards, dialogs for details/edit/reschedule (e.g., `Appointments.tsx:167-677`).
- **Actions:** search/filter, add appointment, cancel booking; all submit through `useAppointmentActions` so the server owns the source of truth (`apps/salonmind-tenant-dashboard/src/hooks/owner/useAppointments.ts`, `Appointments.tsx:108-248`).
- **Data source:** ✅ REAL API — `useAppointments` (`apps/salonmind-tenant-dashboard/src/hooks/owner/useAppointments.ts`) calls `ownerAppointmentsService.list` (`apps/salonmind-tenant-dashboard/src/services/owner/appointments.service.ts`) → `GET /v1/owner/appointments` (`salonmind-services/salonmind-apis/src/modules/owner/routes/appointments.routes.js:8-15`). Creates hit `POST /v1/owner/appointments`, cancels use `POST /v1/owner/appointments/:id/cancel`, and deletes call `DELETE /v1/owner/appointments/:id`. When selecting services/staff/clients, the component reuses the React Query caches from the other modules.

### Clients (`apps/salonmind-tenant-dashboard/src/pages/Clients.tsx`)
- **Fields:** client cards with visits/spend, dialogs for view/edit/history/messaging (`Clients.tsx:133-642`).
- **Actions:** add/edit/delete clients invoke `useClientActions` so records persist to Mongo (`apps/salonmind-tenant-dashboard/src/hooks/owner/useClients.ts`, `Clients.tsx:77-218`).
- **Data source:** ✅ REAL API — `useClients` (`apps/salonmind-tenant-dashboard/src/hooks/owner/useClients.ts`) uses `ownerClientsService.list` (`apps/salonmind-tenant-dashboard/src/services/owner/clients.service.ts`) which hits `GET /v1/owner/clients` (`salonmind-services/salonmind-apis/src/modules/owner/routes/clients.routes.js:6-15`). Mutations call `POST /v1/owner/clients`, `PATCH /v1/owner/clients/:id`, and `DELETE /v1/owner/clients/:id`. Client history remains mocked (API stub returns an empty array), but the primary cards now reflect live data.

### Staff (`apps/salonmind-tenant-dashboard/src/pages/Staff.tsx`)
- **Fields:** staff performance cards, stats widgets (`Staff.tsx:138-545`).
- **Actions:** add/edit/delete/toggle staff operate through `useStaffActions` with React Query invalidation so UI reflects DB state (`apps/salonmind-tenant-dashboard/src/hooks/owner/useStaff.ts`, `Staff.tsx:41-175`).
- **Data source:** ✅ REAL API — `useStaff` (`apps/salonmind-tenant-dashboard/src/hooks/owner/useStaff.ts`) fetches from `ownerStaffService.list` (`apps/salonmind-tenant-dashboard/src/services/owner/staff.service.ts`) → `GET /v1/owner/staff` (`salonmind-services/salonmind-apis/src/modules/owner/routes/staff.routes.js:6-12`). Mutations target `POST /v1/owner/staff`, `PATCH /v1/owner/staff/:id`, `PATCH /v1/owner/staff/:id/status`, and `DELETE /v1/owner/staff/:id`. Onboarding now seeds TenantStaff rows during `/confirm`, so these screens immediately show the team defined in onboarding.

### Services (`apps/salonmind-tenant-dashboard/src/pages/Services.tsx`)
- **Fields:** service stats, categories, grid of services with edit/delete buttons (`Services.tsx:185-399`).
- **Actions:** add/edit/delete/toggle uses `useServiceActions` so CRUD operations hit the backend and invalidate `["owner-services", activeBranchId]` (`apps/salonmind-tenant-dashboard/src/hooks/owner/useServices.ts`, `Services.tsx:52-184`).
- **Data source:** ✅ REAL API — `useServices` (`apps/salonmind-tenant-dashboard/src/hooks/owner/useServices.ts`) calls `ownerServicesService.list` (`apps/salonmind-tenant-dashboard/src/services/owner/services.service.ts`) → `GET /v1/owner/services` (`salonmind-services/salonmind-apis/src/modules/owner/routes/services.routes.js:6-15`). Mutations map to `POST`, `PATCH`, `PATCH /:id/status`, and `DELETE` endpoints. Onboarding confirmation seeds initial `TenantServiceItem` entries for the default branch to keep parity with the earlier tenant document arrays.

### Products (`apps/salonmind-tenant-dashboard/src/pages/Products.tsx`)
- **Fields:** product cards, stats, filters (`Products.tsx:275-838`).
- **Actions:** add/edit/delete products mutate `useState` arrays (`Products.tsx:223-260`, `274-689`).
- **Data source:** ❌ MOCK ONLY — `initialProducts` & `categories` constants populate all visuals (`Products.tsx:65-197`).

### Inventory (`apps/salonmind-tenant-dashboard/src/pages/Inventory.tsx`)
- **Fields:** stats, filters, product grid with stock progress bars (`Inventory.tsx:93-736`).
- **Actions:** add/edit/delete products, low-stock badges; everything works on `inventoryData` arrays and component state (`Inventory.tsx:25-90`).
- **Data source:** ❌ MOCK ONLY — no service calls; CRUD modals simply reset state.

### Revenue (`apps/salonmind-tenant-dashboard/src/pages/Revenue.tsx`)
- **Fields:** revenue KPIs, charts, service breakdown, payment method list, top staff (`Revenue.tsx:48-292`).
- **Actions:** tab switch between monthly/daily just toggles chart data; no network usage.
- **Data source:** ❌ MOCK ONLY — chart/feed arrays defined upfront (`Revenue.tsx:7-44`).

### Profile / Settings (`apps/salonmind-tenant-dashboard/src/pages/ProfileSettings.tsx`)
- **Fields:** tabs for personal info, salon details, notifications, security (`ProfileSettings.tsx:58-470`).
- **Actions:** Save buttons do not call APIs; they update component state only (`ProfileSettings.tsx:87-285`, `291-377`, `381-465`).
- **Data source:** ❌ MOCK ONLY — `useState` seeds with placeholder data for user + business hours (`ProfileSettings.tsx:23-55`).

### Help (`apps/salonmind-tenant-dashboard/src/pages/Help.tsx`)
- **Fields:** search box, contact tiles, tutorials, guides, FAQs (`Help.tsx:110-328`).
- **Actions:** Buttons are static; no network requests.
- **Data source:** ❌ MOCK ONLY — `faqs`, `videoTutorials`, `guides` constants are embedded (`Help.tsx:19-106`).

### Onboarding Flow (`apps/salonmind-tenant-dashboard/src/pages/Onboarding.tsx`)
- **Fields:** stepper covers Welcome → Salon Details → Business Hours → Services → Staff → Plan/Payment → Complete (`Onboarding.tsx:105-863`).
- **Key actions:**
  - Save profile details triggers `ownerService.saveProfile` (PUT `/v1/owner/onboarding/profile`) `Onboarding.tsx:157-173`.
  - Save hours/services/staff call respective endpoints with validations for ≥3 services and ≥1 staff (`Onboarding.tsx:175-213`, `185-201`).
  - Checkout + confirm payment call `POST /v1/owner/onboarding/checkout` and `/confirm`, storing the returned `defaultBranchId` to `localStorage` (`Onboarding.tsx:234-255`).
  - Completion refreshes user profile via `authService.fetchProfile` through `useAuth.refreshUser` (`Onboarding.tsx:265-274`, `AuthContext.tsx:152-163`).
- **Data source:** ✅ REAL API — backend routes exist under `salonmind-services/salonmind-apis/src/modules/owner/routes/onboarding.routes.js:7-19`; controllers delegate to `onboarding.service.js` and `tenant.service.js` (e.g., payment confirmation + default branch auto-creation at `onboarding.service.js:40-150`).

## Auth & Data Infrastructure
- **Auth context:** `AuthContext` persists `auth_token`, `refresh_token`, and `user_data` keys in `localStorage` during OTP login (`apps/salonmind-tenant-dashboard/src/contexts/AuthContext.tsx:42-134`) and rehydrates them on mount. Only OTP routes from `authService` are used (`apps/salonmind-tenant-dashboard/src/services/authService.ts:12-58`), matching the OTP-only requirement.
- **Axios client:** `apiClient` injects `Authorization: Bearer <token>` and `X-Branch-Id` headers for non-auth calls and logs every request (`apps/salonmind-tenant-dashboard/src/services/api.ts`). 401s trigger a refresh-token flow that hits `POST /v1/auth/salon-owner/token/refresh`, updates `lastUsedAt` on the session, and retries the original request once. On refresh failure the helper `clearStoredSession` wipes tokens + React Query cache (`apps/salonmind-tenant-dashboard/src/utils/session.ts`).
- **React Query usage:** Multiple hooks exist now — `useStaff`, `useServices`, `useClients`, `useAppointments` — each defined under `apps/salonmind-tenant-dashboard/src/hooks/owner/*` with matching mutation helpers. Query keys incorporate `activeBranchId` where appropriate to keep caches isolated per branch.

## Backend Data Sources (salonmind-services/salonmind-apis)
- `ownerService.getTenantContext` is backed by `GET /v1/owner/me/context` (`owner.routes.js:6-9` + `owner.controller.js:5-11`) which delegates to `tenant.service.js:getTenantContext` for tenant/subscription/branch resolution, including branch fallback logic (`tenant.service.js:137-242`).
- Onboarding endpoints persist profile/hours/services/staff mutations and orchestrate subscription + default branch creation plus `user.isOnboarded` toggling (`onboarding.service.js:20-170`). During payment confirmation we now seed the multi-branch collections (`TenantStaff`, `TenantServiceItem`) so dashboard modules have starter entries.
- Branch APIs (`salonmind-services/salonmind-apis/src/modules/owner/routes/branches.routes.js:10-27`) support list/create/update/set-default and the new `POST /v1/owner/branches/active` endpoint that stores `user.activeBranch`. Plan limits are enforced through `subscriptionGuards.js:45-120`.
- Staff, services, clients, and appointments have dedicated controllers/routes under `salonmind-services/salonmind-apis/src/modules/owner/controllers/*` and `routes/*`, each persisting to the new Mongo models (`TenantStaff`, `TenantServiceItem`, `TenantClientProfile`, `TenantAppointmentRecord`).

## Missing APIs vs. UI Expectations
React Query is wired only for Appointments, Clients, Staff, and Services. The remaining dashboard widgets still expect data that has no live backend:

1. Overview KPIs/charts (`apps/salonmind-tenant-dashboard/src/pages/Overview.tsx`) — needs reporting endpoints (revenue summaries, appointment counts, etc.).
2. Products + Inventory modules need `/v1/owner/products` and `/v1/owner/inventory` CRUD routes (currently mocks in `Products.tsx` + `Inventory.tsx`).
3. Revenue analytics panel needs `/v1/owner/revenue/*` time-series endpoints.
4. Profile/Settings and Help screens would benefit from `/v1/owner/profile` and `/v1/support/resources` APIs if we plan to persist toggles or knowledge-base data.

Until those APIs exist (and the frontend swaps the mock arrays), the remaining modules show placeholder numbers only.
