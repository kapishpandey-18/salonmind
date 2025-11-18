# SalonMind People - Frontend Portal

Staff and admin interface for salon management.

---

## 🎨 Technology Stack

- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 6.3.5
- **UI Library:** Radix UI + Tailwind CSS
- **Components:** shadcn/ui (40+ components)
- **Icons:** Lucide React
- **State:** Context API (will migrate to Redux Toolkit)
- **Routing:** None (will add React Router v6)

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
# Runs on http://localhost:5173
```

### Build

```bash
npm run build
```

---

## 📁 Current Structure

```
src/
├── App.tsx                  # Main app with lazy loading
├── main.tsx                 # Entry point
├── components/             # All components (mixed)
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   ├── Appointments.tsx
│   ├── Clients.tsx
│   ├── Services.tsx
│   ├── Staff.tsx
│   ├── Inventory.tsx
│   ├── Products.tsx
│   ├── Revenue.tsx
│   ├── ProfileSettings.tsx
│   ├── ui/                 # Radix UI components
│   └── figma/              # Figma-generated
├── contexts/
│   └── AuthContext.tsx     # Auth state
├── services/
│   ├── api.ts              # Axios wrapper
│   └── authService.ts
├── types/
│   └── index.ts            # TypeScript types
├── constants/
│   └── api.ts              # API endpoints
├── utils/
│   └── logger.ts
└── styles/
    └── globals.css         # Tailwind
```

---

## 🎯 Target Structure (After Restructuring)

```
src/
├── pages/                  # Route-based pages
│   ├── RootLayout.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── clients/
│   ├── appointments/
│   ├── services/
│   ├── staff/
│   ├── inventory/
│   └── revenue/
├── components/
│   ├── layout/            # Header, Sidebar, Footer
│   ├── shared/            # Reusable components
│   └── ui/                # Radix UI (keep as is)
├── store/                 # Redux Toolkit
│   └── slices/
├── services/              # API services
├── hooks/                 # Custom hooks
├── utils/
├── types/
└── constants/
```

---

## 🔧 Features

### Current (UI Only)

- ✅ Login/Signup UI
- ✅ Dashboard overview
- ✅ Appointments calendar view
- ✅ Clients list and details
- ✅ Services catalog
- ✅ Staff management UI
- ✅ Inventory tracking UI
- ✅ Revenue analytics charts
- ✅ Profile settings

### Target (Full Functionality)

- [ ] Redux state management
- [ ] React Router navigation
- [ ] Protected routes
- [ ] API integration
- [ ] Real-time updates
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Dark mode
- [ ] Testing (Jest + React Testing Library)

---

## 📝 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

---

## 🔗 Related

- **Backend:** `../salonmind-service/`
- **Docs:** `../RESTRUCTURING_PLAN.md`
- **Comparison:** `../ARCHITECTURE_COMPARISON.md`

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Status:** Initial Setup - Ready for Restructuring  
**Last Updated:** November 13, 2025
