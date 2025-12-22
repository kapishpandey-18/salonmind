# SalonMind Owner – Tenant Login & Onboarding Flow

This document walks through the complete salon-owner journey inside **apps/salonmind-tenant-dashboard** from OTP login through the prepaid onboarding gate. Use it as the source of truth when debugging auth, onboarding persistence, or default data seeding.

---

## 1. Authentication Overview

| Step | UI Surface | API | Notes |
| --- | --- | --- | --- |
| Request OTP | `Login.tsx` (phone step) | `POST /v1/auth/salon-owner/otp/send` | Accepts `phone` (E.164 or 10-digit). Response returns `challengeId`. |
| Verify OTP | `Login.tsx` (code step) | `POST /v1/auth/salon-owner/otp/verify` | Payload `{ challengeId, otp }`. Dev OTP defaults to `123456`. Success payload: `{ user, accessToken, refreshToken }`. |
| Token storage | `AuthContext.tsx` | — | Saves tokens under `STORAGE_KEYS.AUTH_TOKEN`, `REFRESH_TOKEN`, and user snapshot under `USER_DATA`. |
| Refresh flow | `services/api.ts` | `POST /v1/auth/salon-owner/token/refresh` | Runs once per 401, validates session, rotates access token, updates `lastUsedAt`, and retries the original request. Failure clears session + React Query cache. |

### Session Claims
- `accessToken`/`refreshToken` JWT payload includes:
  - `sub`: Mongo `User._id`
  - `sessionId`: Mongo `Session._id`
  - `surface`: `"SALON_OWNER"`
  - `tokenType`: `"ACCESS"` or `"REFRESH"`
- `sessionId` is always a plain ObjectId string. Middleware validates the session, ensures it’s active, and matches the `sub`.

---

## 2. Routing After Login

`AppContent` decides what to render based on `AuthContext` state:

1. **No valid tokens** → `<Login />`
2. **Authenticated but `user.isOnboarded === false`** → `<Onboarding />`
3. **Authenticated and onboarded** → `<Dashboard />`

Auto-redirect happens immediately after OTP verification or after onboarding confirmation when `user.isOnboarded` flips to true.

---

## 3. Onboarding Wizard (apps/salonmind-tenant-dashboard/src/pages/Onboarding.tsx)

### Step Indexes

| Index | Name | Purpose | API |
| --- | --- | --- | --- |
| 0 | Welcome | Intro copy, no data. | — |
| 1 | Salon Details | Owner + salon profile information. | `PUT /v1/owner/onboarding/profile` |
| 2 | Business Hours | Weekly schedule (open/close per day). | `PUT /v1/owner/onboarding/business-hours` |
| 3 | Services | Initial catalog. Minimum **3** entries required to proceed. | `PUT /v1/owner/onboarding/services` |
| 4 | Staff | Initial team roster. Minimum **1** entry required. | `PUT /v1/owner/onboarding/staff` |
| 5 | Choose Plan + Payment | Select subscription plan and simulate payment. | `POST /checkout`, `POST /confirm` |
| 6 | Complete | Success summary + CTA to enter dashboard. | — |

### Validation & Persistence Details
- Each step persists immediately. Data is stored on the tenant document so users can resume if they refresh.
- Service validation enforces ≥3 entries with numeric `price`/`duration`.
- Staff validation enforces ≥1 entry and respects plan employee limits when a pending plan exists.
- Step 5 is a real payment gate:
  1. `POST /v1/owner/onboarding/checkout { planCode }` creates a pending `TenantSubscription` and Razorpay-style order payload.
  2. UI collects simulated payment IDs and calls `POST /v1/owner/onboarding/confirm`.

### Payment Confirmation (Backend Logic)
`salonmind-services/salonmind-apis/src/modules/owner/services/onboarding.service.js:175+`

1. Verifies required fields (`orderId`, `paymentId`, optional Razorpay signature TODO).
2. Activates the pending subscription (`TenantSubscription` documents store plan, status, billing window, provider metadata).
3. Creates a **Main Branch** if the tenant has no branches (`Branch` collection) and sets it as `tenant.defaultBranch`.
4. Seeds real collections:
   - **Services** → `TenantServiceItem` per branch, using onboarding data.
   - **Staff** → `TenantStaff` per branch. If the tenant provided <6 staff entries, the seeder pads with curated defaults (avatar URLs, specialties, ratings, weekly metrics) so the dashboard cards look rich on first load.
5. Marks `user.isOnboarded = true`, `user.isProfileComplete = true`, and sets `user.activeBranch` to the default branch.
6. Returns tenant context payload `{ tenant, subscription, branches, defaultBranchId }`. The frontend stores `defaultBranchId` in `STORAGE_KEYS.ACTIVE_BRANCH_ID`.

### Completing the Flow
- Step 6’s “Go to dashboard” button triggers `AuthContext.refreshUser()`, which fetches the latest `/v1/auth/salon-owner/me` so `isOnboarded` is updated locally.
- `Dashboard` will render immediately after the user object reflects the new state.

---

## 4. Tenant Context & Branch Resolution

Once the dashboard loads, `useTenantContext` calls `GET /v1/owner/me/context`, which returns:

```jsonc
{
  "tenant": { "id": "...", "name": "Salon Name", "logoUrl": "..." },
  "subscription": { "status": "ACTIVE", "planCode": "PRO", "planName": "...", "endDate": "..." },
  "branches": [{ "id": "...", "name": "Main Branch", "isDefault": true, "isActive": true }],
  "activeBranchId": "..."
}
```

Branch selection rules:
- Request header `X-Branch-Id` is optional. If missing or invalid, backend falls back to `user.activeBranch`, then tenant default branch, then the first active branch.
- When the user picks a different branch in the dashboard header, the client calls `POST /v1/owner/branches/active { branchId }`, which persists `user.activeBranch` and invalidates the React Query cache.
- Axios automatically injects `X-Branch-Id` on every non-auth request once `ACTIVE_BRANCH_ID` exists in `localStorage`.

---

## 5. Default Data Seeding Summary

| Data | Source | Collection | When |
| --- | --- | --- | --- |
| Services | Onboarding step 3 entries | `TenantServiceItem` | During `/v1/owner/onboarding/confirm`; per branch. |
| Staff | Onboarding step 4 entries (padded to at least 6 profiles) | `TenantStaff` | Same as above; includes avatar, specialties, ratings, utilization metrics. |
| Branch | Auto-generated “Main Branch” if none exist | `Branch` | During `/confirm`. |
| Subscription | `TenantSubscription` | `createPendingSubscription` at checkout, `activateSubscription` at confirm. |

Existing tenants created before this flow can be backfilled via a one-off script that copies their `tenant.services`/`tenant.staff` arrays into the new collections. New tenants receive the data automatically.

---

## 6. Quick Reference – Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/v1/auth/salon-owner/otp/send` | POST | Start OTP login. |
| `/v1/auth/salon-owner/otp/verify` | POST | Finish OTP login; issues tokens. |
| `/v1/auth/salon-owner/token/refresh` | POST | Refresh access token. |
| `/v1/owner/onboarding/profile` | PUT | Save salon details. |
| `/v1/owner/onboarding/business-hours` | PUT | Save hours array. |
| `/v1/owner/onboarding/services` | PUT | Save initial service catalog (≥3). |
| `/v1/owner/onboarding/staff` | PUT | Save initial staff roster (≥1). |
| `/v1/owner/onboarding/checkout` | POST | Create payment order + pending subscription. |
| `/v1/owner/onboarding/confirm` | POST | Verify payment, activate subscription, seed data, set `isOnboarded`. |
| `/v1/owner/me/context` | GET | Tenant/subscription/branch context for dashboard header. |
| `/v1/owner/branches/active` | POST | Persist selected branch ID. |

Keep this doc updated as new onboarding questions or payment providers are added so everyone has a single reference for the tenant journey.

---

## 7. Post-Onboarding Working Sections

After onboarding, the dashboard renders four business modules that now talk to live APIs via React Query.

### Staff Management (`src/pages/Staff.tsx`)
- **Fetch:** `GET /v1/owner/staff` using the active branch ID.
- **Create:** `POST /v1/owner/staff` with the modal payload (name, contact info, avatar URL, specialties, rating, availability, status, notes).
- **Update/Delete:** `PATCH` and `DELETE /v1/owner/staff/:id`.
- Cards render avatars, specialties, rating, appointment counts, revenue, utilization, and quick call/email/message actions straight from `TenantStaff`.

### Services Catalog (`src/pages/Services.tsx`)
- **Fetch:** `GET /v1/owner/services`.
- **Mutations:** `POST /v1/owner/services`, `PATCH /v1/owner/services/:id`, `DELETE /v1/owner/services/:id`.
- Each tile shows live duration, price, category, description, and active status based on `TenantServiceItem`.

### Clients CRM (`src/pages/Clients.tsx`)
- **Fetch:** `GET /v1/owner/clients` (tenant-scoped).
- **Mutations:** `POST /v1/owner/clients`, `PATCH /v1/owner/clients/:id`.
- Cards expose visit counts, lifetime value, notes, and status using `TenantClientProfile`. History endpoint (`GET /v1/owner/clients/:id/history`) is wired as a stub for future enhancements.

- **Fetch:** `GET /v1/owner/appointments?branchId=&from=&to=&search=&page=&limit=` returns `TenantAppointmentRecord` entries for the selected branch with pagination + filters.
- **Create:** Quick booking posts to `POST /v1/owner/appointments` with `{ clientId, staffId, serviceIds[], branchId, startAt?, date?, startTime?, duration?, notes?, totalAmount? }`.
- **Cancel/Update:** `POST /v1/owner/appointments/:id/cancel` and `PATCH /v1/owner/appointments/:id`.
- **Delete:** `DELETE /v1/owner/appointments/:id` performs a soft delete (keeps historical data).
- The form reuses cached staff/services/clients lists so dropdowns stay in sync with the latest records.

Because these sections now hit production APIs end-to-end, there are no mock arrays left in the owner workflow: adding staff/services/clients immediately populates Mongo, and appointment creation consumes those same records.
