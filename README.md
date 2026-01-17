# SalonMind - Multi-Tenant Salon Management Platform

A comprehensive AI-powered salon management SaaS platform for salon owners, staff, and administrators.

## 📁 Project Structure

```
salonmind/
├── apps/
│   ├── salonmind-tenant-dashboard/   # Salon owner dashboard (React + TypeScript)
│   ├── salonmind-dashboard/          # Platform admin console
│   └── salonmind-people/             # Employee mobile app (Capacitor + React)
├── salonmind-services/
│   └── salonmind-apis/               # Backend REST API (Node.js + Express + MongoDB)
├── packages/
│   ├── auth-client/                  # Shared authentication client library
│   ├── ui/                           # Shared UI components (planned)
│   ├── config/                       # Shared configurations (planned)
│   ├── utils/                        # Shared utilities (planned)
│   └── ai/                           # AI helpers (planned)
├── docs/                             # Documentation
└── turbo.json                        # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9.x
- MongoDB

### Install Dependencies
```bash
pnpm install
```

### Run All Apps (Development)
```bash
pnpm dev
```

### Run Individual Apps

**Tenant Dashboard (Owner App):**
```bash
cd apps/salonmind-tenant-dashboard
pnpm dev
```

**Employee App:**
```bash
cd apps/salonmind-people
pnpm dev
```

**Admin Dashboard:**
```bash
cd apps/salonmind-dashboard
pnpm dev
```

**Backend API:**
```bash
cd salonmind-services/salonmind-apis
pnpm install
pnpm run dev
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Testing:** Playwright (E2E)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + OTP-based login

### Tooling
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Mobile:** Capacitor (for salonmind-people)

## 📦 Features

### Tenant Dashboard (Owner App)
- 🔐 OTP-based authentication
- 📋 Onboarding flow for new tenants
- 👥 Client management
- 👨‍💼 Staff management
- 📅 Appointment scheduling
- 💇 Services & pricing
- 📦 Inventory management
- 🛍️ Products catalog
- 💰 Revenue analytics & reports
- ⚙️ Branch & settings management
- 📊 Dashboard with KPIs

### Backend API Modules
- **Auth:** OTP generation, token management, session handling
- **Owner:** Full CRUD for appointments, branches, clients, inventory, products, reports, revenue, services, settings, staff

## 🧪 Testing

### Run E2E Tests (Tenant Dashboard)
```bash
cd apps/salonmind-tenant-dashboard
pnpm test           # Run all tests
pnpm test:ui        # Interactive UI mode
pnpm test:headed    # Run with browser visible
pnpm test:report    # View test report
```

## 📂 Environment Variables

Copy `.env.example` to `.env` in each app/service directory and configure:

```bash
# API
MONGODB_URI=mongodb://localhost:27017/salonmind
JWT_SECRET=your-secret-key
PORT=5000

# Frontend Apps
VITE_API_URL=http://localhost:5000/api
```

## 🌿 Git Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev`  | Active development |
| `stg`  | Staging environment |
| `prod` | Production deployment |

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm e2e` | Run E2E tests |

---

**Developer:** Kapish Pandey  
**Last Updated:** January 2026
