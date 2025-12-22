# SalonMind - Salon Management System

AI-powered salon management platform for staff and customers.

## 📁 Project Structure

```
salonmind/
├── apps/
│   ├── salonmind-tenant-daashboard/  # Salon owner (tenant) dashboard – OTP login, onboarding, React Query modules
│   ├── salonmind-dashboard/          # Platform admin console (placeholder scaffold)
│   ├── salonmind-people/             # Employee/mobile experience (Capacitor + React prototype)
│   ├── employee-app/                 # Legacy employee prototype notes
│   └── salonmind/                    # Marketing/landing site placeholder
├── salonmind-services/
│   └── salonind-apis/    # Backend REST API
├── packages/
│   ├── ui/               # Shared component library (placeholder)
│   ├── config/           # Shared tooling configs (placeholder)
│   ├── utils/            # Shared helpers (placeholder)
│   ├── auth/             # Shared auth helpers (placeholder)
│   └── ai/               # Shared AI helpers (placeholder)
└── docs/                 # Documentation hub
```

## 🚀 Quick Start

### Tenant Dashboard (Owner App)
```bash
cd apps/salonmind-tenant-daashboard
pnpm install
pnpm dev
```

### Admin / Landing Apps
> `apps/salonmind-dashboard` and `apps/salonmind` are placeholders until their builds are added.

### Backend API
```bash
cd salonmind-services/salonind-apis
pnpm install
pnpm run dev
```

## 🛠️ Tech Stack

**Frontends:** React 18 + TypeScript + Vite + Tailwind CSS  
**Backend:** Node.js + Express + MongoDB  
**Tooling:** pnpm + TurboRepo

## 📦 Repository

- **Main:** Production-ready code
- **Dev:** Active development

---

**Developer:** Kapish Pandey  
**Last Updated:** November 2025
