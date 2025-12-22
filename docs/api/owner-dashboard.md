# SalonMind Owner Dashboard API

This guide summarizes the owner-facing endpoints that power `apps/salonmind-tenant-dashboard`. Every route lives under the `/v1/owner` namespace inside `salonmind-services/salonmind-apis/src/modules/owner`.

## Auth & Headers

- Auth uses OTP-only flows (`/v1/auth/salon-owner/otp/*`). Successful verify returns `accessToken` + `refreshToken`. Tokens are required for every endpoint below.
- Include `Authorization: Bearer <accessToken>` on all requests.
- Set `X-Branch-Id` to scope branch-aware reads and writes. If omitted, the API resolves the branch in this order: user.activeBranch → tenant default branch → first active branch. Invalid IDs are ignored (no more 400s) and a safe fallback is used.
- `requireActiveSubscription` middleware blocks business APIs when the tenant has no ACTIVE subscription.

## Tenant Context

### `GET /v1/owner/me/context`
Returns tenant-wide metadata for the dashboard header and branch selector.

```jsonc
{
  "tenant": { "id": "tenantId", "name": "Salon Name", "logoUrl": "https://..." },
  "subscription": {
    "status": "ACTIVE",
    "planCode": "PRO",
    "planName": "Pro Plan",
    "endDate": "2026-01-01T00:00:00.000Z"
  },
  "branches": [
    { "id": "branchId", "name": "Main Branch", "isDefault": true, "isActive": true }
  ],
  "activeBranchId": "branchId"
}
```

The endpoint never fails with 400 for missing/invalid branch headers; it silently falls back and persists the resolved branch to `user.activeBranch`.

## Onboarding & Subscription Gate

| Step | Method & Path | Notes |
| --- | --- | --- |
| Profile | `PUT /v1/owner/onboarding/profile` | Basic tenant + owner info |
| Business Hours | `PUT /v1/owner/onboarding/business-hours` | Array of day objects |
| Services | `PUT /v1/owner/onboarding/services` | Requires ≥3 services |
| Staff | `PUT /v1/owner/onboarding/staff` | Requires ≥1 staff |
| Checkout | `POST /v1/owner/onboarding/checkout` | Creates Razorpay-style order + pending subscription |
| Confirm | `POST /v1/owner/onboarding/confirm` | Verifies payment, activates subscription, auto-creates Main Branch, seeds initial staff/services rows, marks `user.isOnboarded = true`, returns tenant context |

Payment confirmation response contains `{ tenant, subscription, branches, defaultBranchId }`. The frontend stores `defaultBranchId` as the initial branch selector value.

## Branch Management

- `GET /v1/owner/branches` — list tenant branches (requires active subscription).
- `POST /v1/owner/branches` — create a branch (`{ name, address?, ... }`); checks plan limits (BASIC max 1, PRO max 3, ADVANCED unlimited).
- `PATCH /v1/owner/branches/:id` — update branch metadata / activation state.
- `POST /v1/owner/branches/:id/set-default` — mark a branch as the tenant default.
- `POST /v1/owner/branches/active` — persist the branch selected inside the dashboard header (`{ branchId }`). The backend validates ownership, updates `user.activeBranch`, and future context calls return the new ID.

## Staff (branch-scoped)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/v1/owner/staff` | Uses `X-Branch-Id` (fallback to default) and returns paginated `{ staff: TenantStaff[] }`. Supports search + pagination query params. |
| `POST` | `/v1/owner/staff` | Requires branch context + `{ name, role?, email?, phone? }`. Respects plan employee limits. |
| `PATCH` | `/v1/owner/staff/:id` | Update staff fields; optional `branchId` switches branches. |
| `PATCH` | `/v1/owner/staff/:id/status` | Enable/disable staff via `{ isActive: boolean }`. |
| `DELETE` | `/v1/owner/staff/:id` | Soft delete (sets `isDeleted/deletedAt`). Returns 404 if staff not found. |

Onboarding now auto-seeds TenantStaff records for the default branch so newly onboarded owners see their roster immediately.

## Services (branch-scoped)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/v1/owner/services` | Lists services for the active branch with optional `search/page/limit`. |
| `POST` | `/v1/owner/services` | Requires `{ name, duration, price }`. |
| `PATCH` | `/v1/owner/services/:id` | Update metadata or move to another branch. |
| `PATCH` | `/v1/owner/services/:id/status` | Enable/disable services via `{ isActive: boolean }`. |
| `DELETE` | `/v1/owner/services/:id` | Soft delete (marks `isDeleted`). |

Onboarding seeding mirrors staff so the branch has its starter catalog.

## Clients (tenant-scoped)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/v1/owner/clients` | Lists tenant clients with `search`, `page`, and `limit` params; respects branch filters when provided. |
| `GET` | `/v1/owner/clients/:id` | Fetch detail view for a single client. |
| `POST` | `/v1/owner/clients` | Create client with `{ fullName, phoneNumber, email?, notes?, branchId? }`. |
| `PATCH` | `/v1/owner/clients/:id` | Update client profile/loyalty fields. |
| `GET` | `/v1/owner/clients/:id/history` | Returns visit/payment history (currently stubbed to an empty array). |
| `DELETE` | `/v1/owner/clients/:id` | Soft delete. |

Client records store `lastVisitBranch` when supplied so reporting can stay branch-aware later.

## Appointments (branch-scoped)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/v1/owner/appointments?from=&to=&branchId=` | Returns paginated `{ appointments: TenantAppointmentRecord[] }` filtered by branch/date/search/status. |
| `POST` | `/v1/owner/appointments` | Create appointment with service + staff references (validated against the same tenant/branch). Supports `serviceIds[]`. |
| `PATCH` | `/v1/owner/appointments/:id` | Update schedule, status, or assignments. |
| `POST` | `/v1/owner/appointments/:id/cancel` | Marks `status = "cancelled"` and logs cancellation metadata. |
| `DELETE` | `/v1/owner/appointments/:id` | Soft delete. |

## Middleware & Limits

- `requireActiveSubscription` — rejects with 403 when subscription missing/expired.
- `requireBranchAccess` — ensures the resolved branch belongs to the tenant and is active.
- `enforcePlanLimits` — BASIC plan: `maxBranches=1`, `maxEmployees=10`; PRO: `maxBranches=3`, `maxEmployees=25`; ADVANCED: unlimited. The middleware currently protects branch + staff creation endpoints.

Keep this document in sync with future domain modules so the tenant-dashboard team can wire React Query hooks directly to production-ready endpoints.
