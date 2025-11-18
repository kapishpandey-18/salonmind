# SalonMind - Complete Salon Management System

Transform your salon business with AI-powered management tools.

---

## 📁 Project Structure

```
salonmind/
├── salonmind-people/       # Frontend - Staff & Admin Portal
│   ├── React 18 + TypeScript + Vite
│   ├── Radix UI + Tailwind CSS
│   └── shadcn/ui Components
│
├── salonmind-service/      # Backend - REST API
│   ├── Node.js + Express + MongoDB
│   ├── JWT Authentication
│   └── Modular Architecture
│
├── RESTRUCTURING_PLAN.md
├── ARCHITECTURE_COMPARISON.md
└── README.md (this file)
```

---

## 🚀 Quick Start

### Frontend (SalonMind People)

```bash
cd salonmind-people
npm install
npm run dev  # Runs on http://localhost:5173
```

### Backend (SalonMind Service)

```bash
cd salonmind-service
npm install
npm run dev  # Runs on http://localhost:3000
```

---

## ✨ Features

### Current (Figma Export)

- 📊 Dashboard with analytics UI
- 📅 Appointments calendar view
- 👥 Clients management interface
- 👨‍💼 Staff management UI
- 💼 Services catalog display
- 💰 Revenue analytics charts
- 📦 Inventory management UI
- 🛍️ Products catalog
- ⚙️ Profile settings
- ❓ Help & support

### Target (After Restructuring)

- ✅ Full CRUD operations for all modules
- ✅ Redux state management
- ✅ React Router navigation
- ✅ Backend API integration
- ✅ Real-time updates
- ✅ SMS notifications
- ✅ Online booking portal
- ✅ Staff availability management
- ✅ Comprehensive testing

---

## 🎯 Naming Convention

Following the **Beyond Beauty Studio (BBS)** pattern:

| Project                  | Frontend             | Backend               |
| ------------------------ | -------------------- | --------------------- |
| **CleanMyCar**           | user-app, partners   | backend               |
| **Beyond Beauty Studio** | bbs-people           | bbs-service           |
| **SalonMind**            | **salonmind-people** | **salonmind-service** |

**-people** = Staff/Admin interface  
**-service** = Backend API

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**

- React 18.3 + TypeScript
- Vite 6.3.5
- Radix UI + Tailwind CSS
- shadcn/ui components
- Lucide icons

**Backend:**

- Node.js + Express 4.18
- MongoDB + Mongoose 8.0
- JWT authentication
- bcrypt password hashing

---

## 📚 Documentation

- **RESTRUCTURING_PLAN.md** - Complete migration guide from Figma export to production
- **ARCHITECTURE_COMPARISON.md** - Comparison with CleanMyCar and BBS projects
- **Frontend README** - See `salonmind-people/src/README.md`
- **Backend README** - See `salonmind-service/README.md` (to be created)

---

## 🔄 Current Status

**Phase:** Initial Setup ✅  
**Next:** Install dependencies and begin restructuring

### Completed:

- [x] Project renamed to follow BBS naming convention
- [x] Separated frontend (salonmind-people) and backend (salonmind-service)
- [x] Created documentation

### TODO:

- [ ] Install React Router + Redux Toolkit (frontend)
- [ ] Create modular directory structure (frontend)
- [ ] Migrate pages and components
- [ ] Set up Redux store
- [ ] Restructure backend into modules
- [ ] Connect frontend to backend APIs
- [ ] Add testing infrastructure

---

## 👥 Team

**Development:** KridAI Team  
**Repository:** cleanmycar (monorepo)

---

## 📄 License

Private - KridAI Products

---

**Last Updated:** November 13, 2025
