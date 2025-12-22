# SalonMind – Tenant Dashboard Flow

This note explains how the salon owner dashboard (`apps/salonmind-tenant-dashboard`) moves the user from OTP login through onboarding and into the dashboard experience. Use it when you need to debug auth/onboarding or extend the dashboard modules.

## 1. Top-Level Routing

- `App.tsx` wraps everything in `AuthProvider` and renders `AppContent`.
- `AppContent` decides which surface to show:
  1. **Not authenticated** → `<Login />`
  2. **Authenticated but `user.isOnboarded === false`** → `<Onboarding />`
  3. **Authenticated and onboarded** → `<Dashboard />`
- `AuthProvider` (`contexts/AuthContext.tsx`) loads persisted tokens + user data from `localStorage` (`STORAGE_KEYS`) so the correct branch renders on refresh.

## 2. OTP Authentication Flow

### 2.1 Phone capture
1. `Login` component starts in the `phone` step (`useState`).
2. Phone number is normalized/validated as a 10-digit Indian mobile number.
3. On submit it calls `sendOTP(cleanPhone)` from `AuthContext`.
4. `AuthContext.sendOTP` delegates to `authService.sendOTP`, which posts to `/v1/auth/salon-owner/otp/send`.
5. API response returns a `challengeId`; UI advances to the `otp` step and keeps `challengeId` in component state.

### 2.2 OTP verification
1. User enters a 6-digit code through the `InputOTP` control.
2. Submit triggers `loginWithOTP({ challengeId, otp })`.
3. `AuthContext.loginWithOTP` posts to `/v1/auth/salon-owner/otp/verify` via `authService`.
4. Success payload includes `user`, `accessToken`, `refreshToken`.
5. Tokens + user snapshot are saved into `localStorage`.
6. `isAuthenticated` flips to true, causing `AppContent` to re-render and either open onboarding or dashboard based on `user.isOnboarded`.
7. Resend uses `/v1/auth/salon-owner/otp/resend` and rotates the challenge.

## 3. Onboarding Flow

The onboarding wizard (`pages/Onboarding.tsx`) runs when `user.isOnboarded` is false. It now writes data step-by-step using `/v1/owner/onboarding/*` APIs.

| Step | Purpose | Data collected |
| ---- | ------- | -------------- |
| 0 – Welcome | Set expectations | None |
| 1 – Salon Details | Basic company profile | Salon + owner info, address |
| 2 – Business Hours | Operating schedule | Day-wise open/close & closure toggles |
| 3 – Services | Initial catalog | **Minimum 3** services (name, duration, price) |
| 4 – Staff | Early roster | **Minimum 1** staff member (name, role, email) |
| 5 – Plan & Payment | Real checkout | Plan selection + payment confirmation |
| 6 – Complete | Summary screen | No extra fields; prompts to enter dashboard |

Backend steps:

1. Each form step persists immediately (`/profile`, `/business-hours`, `/services`, `/staff`) so data is never lost.
2. `PUT /services` enforces the ≥3 services rule and `PUT /staff` enforces ≥1 staff member plus plan caps when a plan/pending plan exists.
3. Step 5 calls `POST /v1/owner/onboarding/checkout` with the selected `planCode`, which creates a pending `TenantSubscription` and returns an order.
4. The UI simulates payment and calls `POST /v1/owner/onboarding/confirm` with the `orderId` + `paymentId`. This endpoint verifies the order, activates the subscription, creates a **Main Branch** (if none exist), and sets `user.isOnboarded = true`.
5. `confirm` returns tenant context + the default branch ID; the client stores this in `localStorage` via `STORAGE_KEYS.ACTIVE_BRANCH_ID`.
6. Step 6 simply displays the success summary and, on “Go to dashboard”, calls `refreshUser()` via the `AuthContext`.

## 4. Dashboard Navigation Flow & Tenant Context

Once onboarded, `Dashboard` renders a sidebar-driven SPA:

- Sidebar items map to lazy-loaded view modules: `Overview`, `Appointments`, `Clients`, `Staff`, `Services`, `Products`, `Inventory`, `Revenue`, `ProfileSettings`, `Help`.
- `currentView` state (default `overview`) decides which component renders in the main pane.
- Sidebar works on both desktop (static) and mobile (drawer toggle via `sidebarOpen` state).
- `onLogout` prop should call `AuthContext.logout()` when wired; logout clears tokens via `/v1/auth/salon-owner/logout` and drops back to the login screen.

Tenant context & branches:

- `Dashboard` uses React Query to call `GET /v1/owner/me/context` on mount. The header now shows salon name, subscription label, and logo.
- Branches from the response feed a selector in the header. If multiple branches exist, the user can pick the active one; the selection is persisted to `localStorage` under `ACTIVE_BRANCH_ID`.
- The Axios client injects `X-Branch-Id` on every non-auth call so future “business APIs” can scope queries to the active branch.
- Backend helper `requireActiveSubscription` guards `/v1/owner/branches/*` and `enforcePlanLimits` prevents branch/staff creation from exceeding plan limits.

## 5. Persistence & Error Handling

- Tokens (`auth_token`, `refresh_token`) + `user_data` persist across reloads.
- `useAuth` exposes `isLoading` to gate rendering until storage rehydration ends.
- All auth methods toast success/failure messages and surface backend errors for debugging.
- When refresh fails, `api.ts` clears storage and hard-redirects to `/login` to guarantee a clean state.

## 6. Sequence Recap

```
Unauthenticated user
      │
      ▼
Login (phone → OTP) ── send/resend/verify via /v1/auth/salon-owner/*
      │
      ▼
Auth success (tokens stored, user in context)
      │
      ├─ user.isOnboarded === false → Onboarding wizard → writes profile/hours/services/staff → checkout(planCode) → confirm payment (creates subscription + default branch + marks user onboarded)
      │
      └─ user.isOnboarded === true → Dashboard (lazy-loaded modules, tenant context fetched, branch selector drives X-Branch-Id header)
```

Keep this flow handy when adding new guardrails, expanding onboarding questions, or wiring dashboard views to the Express backend.
