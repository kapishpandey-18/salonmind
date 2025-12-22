# SalonMind Owner Dashboard – Smoke Checklist

Use this guide after deploying either the backend (`salonmind-services/salonmind-apis`) or the salon owner dashboard (`apps/salonmind-tenant-dashboard`). It is intentionally high-level so you can finish the checks in <15 minutes.

## Pre-Flight
- Backend: `pnpm --filter ./salonmind-services/salonmind-apis dev` (PORT 5009) with env vars for Mongo + Razorpay test keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). When keys are missing the onboarding confirm endpoint short-circuits with a TODO error.
- Frontend: `pnpm --filter ./apps/salonmind-tenant-dashboard dev` (PORT 3000) with `VITE_API_BASE_URL=http://localhost:5009`.
- Clear browser storage before each run to avoid leftover branch IDs or tokens.

## Smoke Steps

1. **OTP login + onboarding**
   - Visit `/login`.
   - Enter a phone number, request OTP, and verify with the known dev code (`123456` by default).
   - Walk through each onboarding step:
     - Fill salon profile and hours.
     - Add ≥3 services and ≥1 staff member.
     - Choose a plan (BASIC for limit tests, PRO+ for multi-branch).
     - Click “Simulate Payment Success” so `/v1/owner/onboarding/confirm` runs and returns `defaultBranchId`.
   - Expect redirect to the dashboard after Step 6, with tenant context populated.

2. **Dashboard header + branch selector**
   - Header should display salon name, logo (or fallback avatar), and subscription badge that matches the chosen plan.
   - Branch selector should list the “Main Branch” plus any additional branches you created. Selecting a branch fires `useSetActiveBranch`, re-fetches `GET /v1/owner/me/context`, and stores `ACTIVE_BRANCH_ID` in `localStorage`.
   - Use DevTools → Network to confirm application requests now include the `X-Branch-Id` header.

3. **Staff & Services modules (API-backed)**
   - Opening Staff and Services should render the entries you created during onboarding (auto-seeded into the new collections).
   - Create, edit, and delete a staff member and a service. React Query should reflect mutations immediately without full page reloads.

4. **Clients & Appointments modules**
   - Create dummy clients and appointments; confirm they appear in their respective tables and the API calls succeed.
   - Update a record to ensure PATCH routes work.

5. **Branch plan limits**
   - While on BASIC, try creating a second branch via the header shortcut or branches page; expect a toast surface `Plan limit reached`.
   - Upgrade to PRO (via manual DB update or onboarding a new account) and confirm the second branch creation succeeds, plus `POST /v1/owner/branches/active` flips context.

6. **Token refresh + logout**
   - Leave the tab idle until the access token expires, then trigger a request. The axios interceptor should call `/v1/auth/salon-owner/token/refresh` once, issue a fresh access token, and replay the original request.
   - Force a refresh failure (e.g., delete refresh token in storage) and confirm the app clears React Query cache + localStorage, then redirects to `/login`.

Document any failures directly in the PR or release notes before shipping.
