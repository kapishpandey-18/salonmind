# SalonMind Project Guide

## Project Overview

SalonMind is a multi-tenant SaaS platform for salon management. It enables salon owners to manage appointments, staff, services, clients, inventory, and revenue across multiple branches.

### Architecture

```
salonmind/
├── apps/
│   ├── owner-dashboard/      # Salon owners manage business (React + Vite)
│   ├── employee-app/         # Staff view schedules, tasks (React + Vite)
│   └── admin-dashboard/      # Platform admin panel (React + Vite)
├── services/
│   └── api/                  # Backend API (Express + TypeScript)
└── packages/                 # Shared libraries (future)
```

### Tech Stack

**Backend:**
- Node.js + Express
- TypeScript (ES Modules, strict mode)
- MongoDB + Mongoose
- JWT authentication with OTP flow
- Jest for testing

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS v4
- shadcn/ui components
- sonner for toasts

---

## Multi-Tenant Data Model

### Core Entities

| Entity | Description |
|--------|-------------|
| **Tenant** | Business entity (salon company). Created during owner signup. |
| **Branch** | Physical location. A tenant can have multiple branches based on subscription plan. |
| **User** | Person with a role (owner, employee, admin). Owners belong to a tenant. |
| **TenantStaff** | Staff member at a branch (may or may not have a User account). |
| **TenantServiceItem** | Service offered at a branch (e.g., haircut, spa). |
| **TenantClientProfile** | Customer profile scoped to tenant. |
| **TenantAppointmentRecord** | Appointment booking with multi-service support. |
| **TenantProductItem** | Product/inventory item at a branch. |
| **TenantSubscription** | Active subscription linking tenant to a plan. |
| **SubscriptionPlan** | Plan definition (BASIC, PRO, ADVANCED) with limits. |

### Request Scoping

All owner APIs scope data by:
1. `req.auth.tenantId` - From JWT token
2. `X-Branch-Id` header - Active branch (falls back to user's `activeBranch`)

---

## API Structure

### Base URL: `/v1`

**Auth Module** (`/v1/auth/`):
- `POST /admin/otp/send|verify` - Admin OTP flow
- `POST /salon-owner/otp/send|verify|resend` - Owner OTP flow
- `POST /salon-employee/otp/send|verify` - Employee OTP flow
- `POST /*/refresh` - Refresh access token
- `POST /*/logout` - Logout and invalidate session

**Owner Module** (`/v1/owner/`):
- `/me/context` - Get tenant context (subscription, branches, active branch)
- `/onboarding/*` - Multi-step onboarding flow
- `/branches` - Branch CRUD
- `/staff` - Staff CRUD with compensation
- `/services` - Service CRUD
- `/clients` - Client CRUD with history
- `/appointments` - Appointment CRUD
- `/products` - Product CRUD
- `/inventory` - Stock management
- `/revenue/summary` - Revenue analytics
- `/reports/top-services` - Top services report
- `/settings` - User/tenant settings
- `/plans` - List subscription plans

---

## Development Commands

This is a **pnpm monorepo**. Run commands from the project root or package directories.

### From Root

```bash
pnpm install                              # Install all dependencies
pnpm --filter @salonmind/api dev          # Start backend API
pnpm --filter @salonmind/owner-dashboard dev    # Start owner dashboard
pnpm --filter @salonmind/admin-dashboard dev    # Start admin dashboard
pnpm --filter @salonmind/employee-app dev       # Start employee app
```

### Backend (`services/api/`)

```bash
pnpm dev           # Start dev server with tsx watch
pnpm build         # Compile TypeScript to dist/
pnpm start         # Run compiled code
pnpm test          # Run Jest tests
pnpm typecheck     # Type check without emit
```

### Frontend Apps (`apps/owner-dashboard/`, `apps/admin-dashboard/`, `apps/employee-app/`)

```bash
pnpm dev           # Start Vite dev server
pnpm build         # Production build
pnpm preview       # Preview production build
pnpm lint          # ESLint check
```

---

## Authentication Flow

1. **OTP Request**: `POST /auth/salon-owner/otp/send` with `{ phone: "+91..." }`
2. **OTP Verify**: `POST /auth/salon-owner/otp/verify` with `{ challengeId, otp }`
3. **Response**: `{ accessToken, refreshToken, user: { id, tenant, isOnboarded } }`
4. **Token Refresh**: `POST /auth/salon-owner/refresh` with `{ refreshToken }`

### Test Credentials

- Test OTP code: `123456` (when `OTP_TEST_CODE` env var is set)
- Admin allowlist: `ADMIN_ALLOWLIST_NUMBERS` env var

---

## Onboarding Flow

New salon owners complete a multi-step onboarding:

1. **Profile**: Owner name, salon name, address, contact info
2. **Business Hours**: Weekly schedule with open/close times
3. **Services**: Initial service catalog with prices/duration
4. **Staff**: Add team members
5. **Checkout**: Select subscription plan (BASIC/PRO/ADVANCED)
6. **Confirm**: Payment verification, creates branch + subscription

After confirmation, `user.isOnboarded = true` and dashboard is accessible.

---

## Subscription Plans

| Plan | Branches | Staff | Price |
|------|----------|-------|-------|
| BASIC | 1 | 10 | ₹499/mo |
| PRO | 3 | 25 | ₹999/mo |
| ADVANCED | 10 | 50 | ₹1999/mo |

Limits enforced by `requireBranchLimit` and `requireStaffLimit` middleware.

---

## Environment Variables

### Backend Required

```env
# Server
PORT=5009
MONGODB_URI=mongodb://localhost:27017/salonmind
NODE_ENV=development

# JWT Authentication
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TTL_SALON_OWNER=15m
REFRESH_TTL_SALON_OWNER=30d

# OTP
OTP_TTL_MS=300000
OTP_TEST_CODE=123456          # Test mode only - remove in production

# Razorpay Payment
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_TEST_MODE=true       # Set to false in production

# SMS Provider (MSG91)
SMS_PROVIDER=console          # Options: console, msg91
MSG91_AUTH_KEY=your-auth-key
MSG91_SENDER_ID=SLNMND
MSG91_TEMPLATE_ID=your-template-id
MSG91_OTP_TEMPLATE_ID=your-otp-template-id
```

### Frontend Required

```env
VITE_API_BASE_URL=http://localhost:5009/v1
```

---

## Testing

Backend uses Jest with MongoDB Memory Server for integration tests.

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- auth.integration.spec.ts

# Run with coverage
pnpm test -- --coverage
```

Key test files:
- `tests/auth.integration.spec.ts` - OTP flow, token refresh, session validation
- `tests/owner.onboarding.integration.spec.ts` - Onboarding, subscription creation
- `tests/owner.dashboard.integration.spec.ts` - CRUD operations, tenant scoping

---

## Current Implementation Status

### Backend (95% complete)

**Done:**
- OTP authentication for all user types
- Owner onboarding flow with payment
- All CRUD endpoints (staff, services, clients, appointments, products, inventory)
- Revenue analytics and reports
- Subscription plan enforcement
- Multi-branch support
- TypeScript migration complete

**Pending:**
- Real Razorpay integration (currently test mode)
- SMS service integration (currently mocked)
- Employee mobile app APIs
- Push notifications

### Frontend (85% complete)

**Done:**
- Login page with Figma design
- Onboarding wizard
- Dashboard with sidebar navigation
- All management pages (Staff, Services, Clients, Appointments, Products, Inventory)
- Revenue overview page
- Settings page

**Pending:**
- Calendar view for appointments
- Inventory low-stock alerts
- Real-time notifications
- Mobile responsive refinements
- Some Figma design alignment

---

## Go-Live Checklist (March 18)

### Critical Path

- [ ] Razorpay production integration
- [ ] SMS provider integration (MSG91 or similar)
- [ ] Production MongoDB setup
- [ ] Domain and SSL configuration
- [ ] Environment secrets management

### High Priority

- [ ] Error boundary for frontend
- [ ] Loading states for all async operations
- [ ] Form validation polish
- [ ] Mobile responsive testing
- [ ] Basic analytics tracking

### Nice to Have

- [ ] Calendar view for appointments
- [ ] Push notifications
- [ ] Dark mode
- [ ] Export functionality

---

## Code Patterns

### API Response Format

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { message: "...", code: 400 } }

// Paginated
{ success: true, data: { items: [...] }, pagination: { page, limit, total } }
```

### Async Handler

All controllers use `asyncHandler` wrapper:

```typescript
import { asyncHandler } from "../../../utils/asyncHandler.js";

export const getItems = asyncHandler(async (req, res) => {
  const items = await ItemService.list(req.auth.tenantId);
  res.json(ApiResponse.success({ items }));
});
```

### Mongoose Model Pattern

```typescript
interface IModel {
  field: string;
  tenant: Types.ObjectId;
}

interface IModelMethods {
  methodName(): Promise<void>;
}

type IModelDocument = IModel & IModelMethods & Document;

const schema = new Schema<IModel, Model<IModelDocument>, IModelMethods>({...});
```

---

## Common Tasks

### Add a New API Endpoint

1. Create/update service in `src/modules/owner/services/`
2. Create/update controller in `src/modules/owner/controllers/`
3. Add route in `src/modules/owner/routes/`
4. Register route in `src/modules/owner/index.ts`
5. Add integration test

### Add a New Dashboard Page

1. Create page component in `src/pages/`
2. Add route in `Dashboard.tsx` sidebar and content switch
3. Add API hooks if needed
4. Connect to AuthContext for branch/tenant context

---

## MCP Server Connections

MongoDB servers available:
- `mongodb-dev` - Development database
- `mongodb-stg` - Staging database
- `mongodb-prod` - Production database

Use ToolSearch to query MongoDB collections directly for debugging.
