# SalonMind Service - Backend API

REST API for salon management system.

## 🚀 Setup

```bash
npm install
npm run dev     # Development server
npm start       # Production server
```

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

## 📡 Auth Endpoints

- `/v1/auth/admin/*` – Platform admin OTP + token routes
- `/v1/auth/salon-owner/*` – Salon owner OTP + onboarding bootstrap
- `/v1/auth/salon-employee/*` – Employee OTP login

## 🔐 Environment Variables

Create `.env` file:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TTL_ADMIN=15m
ACCESS_TTL_SALON_OWNER=15m
ACCESS_TTL_SALON_EMPLOYEE=15m
REFRESH_TTL_ADMIN=30d
REFRESH_TTL_SALON_OWNER=30d
REFRESH_TTL_SALON_EMPLOYEE=30d
ADMIN_ALLOWLIST_NUMBERS=+15550000001
OTP_TTL_MS=300000
OTP_MAX_ATTEMPTS=5
OTP_MAX_RESENDS=3
```

---

**Port:** 3000 (default)
