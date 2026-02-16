# SalonMind - Multi-Tenant Salon Management Platform

A comprehensive AI-powered salon management SaaS platform for salon owners, staff, and administrators.

## Project Structure

```
salonmind/
├── apps/
│   ├── owner-dashboard/     # Salon owner dashboard (React + TypeScript) [@salonmind/owner-dashboard]
│   ├── admin-dashboard/     # Platform admin console [@salonmind/admin-dashboard]
│   └── employee-app/        # Employee mobile app (Capacitor + React) [@salonmind/employee-app]
├── services/
│   └── api/                 # Backend REST API (Node.js + Express + MongoDB) [@salonmind/api]
├── packages/
│   ├── auth-client/         # Shared authentication client library [@salonmind/auth-client]
│   ├── ui/                  # Shared UI components (planned)
│   ├── config/              # Shared configurations (planned)
│   ├── utils/               # Shared utilities (planned)
│   └── ai/                  # AI helpers (planned)
├── docs/                    # Documentation
└── turbo.json               # Turborepo configuration
```

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9.x
- MongoDB (local or Atlas)

### Install Dependencies
```bash
pnpm install
```

### Environment Setup

Each environment has its own configuration:

```bash
# Backend (services/api/)
.env.development    # Development environment
.env.staging        # Staging environment
.env.production     # Production environment
```

Copy `.env.example` to `.env` and configure:

```bash
# Required variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000

# OTP Configuration
OTP_TTL_MS=300000        # 5 minutes
OTP_MAX_ATTEMPTS=5
OTP_MAX_RESENDS=3
```

### Run All Apps (Development)
```bash
pnpm dev
```

### Run Individual Apps

| App | Command | Port |
|-----|---------|------|
| Owner Dashboard | `pnpm --filter @salonmind/owner-dashboard dev` | 3000 |
| Admin Dashboard | `pnpm --filter @salonmind/admin-dashboard dev` | 3010 |
| Employee App | `pnpm --filter @salonmind/employee-app dev` | 3020 |
| Backend API | `pnpm --filter @salonmind/api dev` | 5000 |

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Radix UI + shadcn/ui | UI Components |
| React Query | Server State Management |
| React Hook Form | Form Handling |
| Recharts | Data Visualization |
| Capacitor | Mobile App (iOS/Android) |
| Playwright | E2E Testing |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | API Framework |
| MongoDB + Mongoose | Database |
| JWT | Access Tokens |
| bcryptjs | Password/OTP Hashing |
| express-rate-limit | Rate Limiting |
| express-validator | Input Validation |

### Tooling
| Tool | Purpose |
|------|---------|
| Turborepo | Monorepo Management |
| pnpm | Package Manager |
| Jest | Unit Testing |

## Architecture

### Multi-Tenancy Model

```
┌─────────────────────────────────────────────────────────┐
│                     Platform Admin                       │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Tenant A     │ │    Tenant B     │ │    Tenant C     │
│  (Salon Owner)  │ │  (Salon Owner)  │ │  (Salon Owner)  │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ - Branches      │ │ - Branches      │ │ - Branches      │
│ - Staff         │ │ - Staff         │ │ - Staff         │
│ - Clients       │ │ - Clients       │ │ - Clients       │
│ - Appointments  │ │ - Appointments  │ │ - Appointments  │
│ - Services      │ │ - Services      │ │ - Services      │
│ - Products      │ │ - Products      │ │ - Products      │
│ - Inventory     │ │ - Inventory     │ │ - Inventory     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │────▶│  OTP Send    │────▶│  SMS/Log    │
│  (App)   │     │  (Rate Ltd)  │     │             │
└──────────┘     └──────────────┘     └─────────────┘
      │                                      │
      │          ┌──────────────┐            │
      └─────────▶│  OTP Verify  │◀───────────┘
                 │  (Rate Ltd)  │
                 └──────────────┘
                        │
                 ┌──────▼──────┐
                 │   Session   │
                 │   Created   │
                 └──────┬──────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
    ┌─────────────┐          ┌──────────────┐
    │ Access Token│          │Refresh Token │
    │ (15 min)    │          │ (30 days)    │
    └─────────────┘          └──────────────┘
```

## API Endpoints

### Authentication (`/v1/auth`)

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/salon-owner/otp/send` | POST | Send OTP to phone | 5/15min |
| `/salon-owner/otp/verify` | POST | Verify OTP | 10/15min |
| `/salon-owner/otp/resend` | POST | Resend OTP | 5/15min |
| `/salon-owner/token/refresh` | POST | Refresh access token | 30/15min |
| `/salon-owner/logout` | POST | Logout session | 100/15min |
| `/salon-owner/me` | GET | Get current user | - |
| `/admin/*` | - | Admin auth endpoints | Same limits |
| `/salon-employee/*` | - | Employee auth endpoints | Same limits |

### Owner APIs (`/v1/owner`)

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| `/onboarding/*` | PUT, POST | Tenant onboarding flow |
| `/me/context` | GET | Get tenant context |
| `/branches` | GET, POST, PATCH, DELETE | Branch management |
| `/branches/active` | POST | Set active branch |
| `/staff` | GET, POST, PATCH, DELETE | Staff management |
| `/services` | GET, POST, PATCH, DELETE | Service catalog |
| `/clients` | GET, POST, PATCH, DELETE | Client profiles |
| `/appointments` | GET, POST, PATCH, DELETE | Appointment scheduling |
| `/products` | GET, POST, PATCH, DELETE | Product catalog |
| `/inventory` | GET, POST, PATCH | Inventory tracking |
| `/revenue` | GET | Revenue analytics |
| `/reports` | GET | Business reports |
| `/settings` | GET, PUT | Salon settings |
| `/plans` | GET | Subscription plans |

### Health Check

```bash
GET /health
# Response: { "success": true, "message": "Server is running", "timestamp": "..." }
```

## Security Features

### Rate Limiting
All auth endpoints are protected with rate limiting:

| Limiter | Limit | Window | Scope |
|---------|-------|--------|-------|
| OTP Send | 5 requests | 15 min | Per phone |
| OTP Verify | 10 requests | 15 min | Per IP |
| Token Refresh | 30 requests | 15 min | Per IP |
| General Auth | 100 requests | 15 min | Per IP |

### Token Security
- Access tokens: Short-lived (15 min), JWT signed
- Refresh tokens: SHA256 hashed in database, rotated on use
- Session validation on every authenticated request

### Multi-Tenant Isolation
- Tenant data isolated via middleware
- Branch-scoped operations via `X-Branch-Id` header
- Role-based access control (Owner, Manager, Staff)

### Client Token Storage Options
```typescript
// Recommended: Secure hybrid storage
import { createSecureWebTokenStorage } from '@salonmind/auth-client';
const storage = createSecureWebTokenStorage();

// Mobile: Native secure storage
import { createCapacitorTokenStorage } from '@salonmind/auth-client';
const storage = createCapacitorTokenStorage();
```

## Features

### Owner Dashboard
- OTP-based authentication
- Guided onboarding flow
- Client management with search/pagination
- Staff management with roles
- Appointment scheduling (calendar view)
- Services & pricing catalog
- Inventory management with low-stock alerts
- Products catalog
- Revenue analytics & KPI dashboard
- Multi-branch support
- Settings & configuration

### Backend API Modules
- **Auth Module:** OTP generation, JWT tokens, session management, rate limiting
- **Owner Module:** Full CRUD for all tenant resources
- **Subscription Module:** Plan limits enforcement

## Testing

### Backend Tests
```bash
pnpm --filter @salonmind/api test                # Run all tests
pnpm --filter @salonmind/api test:integration    # Run integration tests
```

### E2E Tests (Owner Dashboard)
```bash
pnpm --filter @salonmind/owner-dashboard test           # Run all tests
pnpm --filter @salonmind/owner-dashboard test:ui        # Interactive UI mode
pnpm --filter @salonmind/owner-dashboard test:headed    # Run with browser visible
pnpm --filter @salonmind/owner-dashboard test:report    # View test report
```

## Database Models

| Model | Description |
|-------|-------------|
| User | User accounts (owner, staff, admin) |
| Tenant | Salon organization |
| Branch | Salon locations |
| TenantStaff | Staff members |
| Client | Customer profiles |
| Appointment | Booking records |
| Service | Service catalog |
| Product | Product catalog |
| Inventory | Stock tracking |
| TenantSubscription | Active subscriptions |
| SubscriptionPlan | Available plans |
| Session | Auth sessions |
| RefreshToken | Token storage |
| OtpChallenge | OTP verification |

## Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Active development |
| `stg` | Staging environment |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm e2e` | Run E2E tests |

## Environments

| Environment | Database | API URL |
|-------------|----------|---------|
| Development | salonmind-dev | localhost:5000 |
| Staging | salonmind-stg | stg-api.salonmind.com |
| Production | salonmind | api.salonmind.com |

---

**Developer:** Kapish Pandey
**Last Updated:** February 2026
