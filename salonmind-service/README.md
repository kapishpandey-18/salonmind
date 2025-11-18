# SalonMind Service - Backend API

REST API for salon management system.

---

## 🎯 Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4.18
- **Database:** MongoDB
- **ODM:** Mongoose 8.0
- **Authentication:** JWT + bcrypt
- **Logging:** Winston
- **Validation:** express-validator
- **Security:** CORS, Rate Limiting

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### Development

```bash
npm run dev
# Runs on http://localhost:3000
```

### Production

```bash
npm start
```

### Database Seeding

```bash
npm run seed
```

---

## 📁 Current Structure

```
src/
├── server.js              # Express server entry
├── config/                # Configuration
├── controllers/           # Request handlers
├── middleware/            # Express middleware
├── models/                # Mongoose models
├── routes/                # Express routes
├── scripts/
│   └── seed.js           # Database seeding
└── utils/                 # Utilities
```

---

## 🎯 Target Structure (Modular)

```
src/
├── app.js                 # Express app config
├── server.js              # Server entry
├── modules/               # Feature modules
│   ├── auth/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── routes.js
│   ├── clients/
│   ├── appointments/
│   ├── services/
│   ├── staff/
│   └── inventory/
├── shared/                # Shared utilities
│   ├── config/
│   ├── middlewares/
│   └── utils/
└── tests/
    ├── unit/
    └── integration/
```

---

## 🔌 API Endpoints (Planned)

### Authentication

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
GET    /api/v1/auth/me
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
```

### Clients

```
GET    /api/v1/clients
GET    /api/v1/clients/:id
POST   /api/v1/clients
PUT    /api/v1/clients/:id
DELETE /api/v1/clients/:id
```

### Appointments

```
GET    /api/v1/appointments
GET    /api/v1/appointments/:id
POST   /api/v1/appointments
PUT    /api/v1/appointments/:id
DELETE /api/v1/appointments/:id
GET    /api/v1/appointments/calendar
```

### Services

```
GET    /api/v1/services
GET    /api/v1/services/:id
POST   /api/v1/services
PUT    /api/v1/services/:id
DELETE /api/v1/services/:id
```

### Staff

```
GET    /api/v1/staff
GET    /api/v1/staff/:id
POST   /api/v1/staff
PUT    /api/v1/staff/:id
DELETE /api/v1/staff/:id
GET    /api/v1/staff/:id/availability
```

### Inventory

```
GET    /api/v1/inventory
GET    /api/v1/inventory/:id
POST   /api/v1/inventory
PUT    /api/v1/inventory/:id
DELETE /api/v1/inventory/:id
```

---

## 🔐 Authentication

- **JWT Tokens** with 24h expiry
- **Refresh Tokens** for session management
- **Role-Based Access:** admin, staff, client
- **OTP Verification** for sensitive operations

---

## 🗄️ Data Models

### User

```typescript
{
  email: string;
  phoneNumber: string;
  password: string(hashed);
  role: "admin" | "staff" | "client";
  firstName: string;
  lastName: string;
  avatar: string;
  createdAt: Date;
}
```

### Client

```typescript
{
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: Date;
  totalSpent: number;
  status: "vip" | "active" | "new" | "inactive";
  membershipTier: string;
}
```

### Appointment

```typescript
{
  clientId: ObjectId;
  staffId: ObjectId;
  serviceId: ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  totalPrice: number;
}
```

### Service

```typescript
{
  name: string
  description: string
  duration: number (minutes)
  price: number
  category: string
  staffIds: ObjectId[]
}
```

### Staff

```typescript
{
  userId: ObjectId
  specialties: string[]
  availability: {
    day: string
    startTime: string
    endTime: string
  }[]
  performanceMetrics: object
}
```

---

## 📝 Available Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Start dev server with nodemon  |
| `npm start`    | Start production server        |
| `npm run seed` | Seed database with sample data |

---

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/salonmind
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## 🧪 Testing (TODO)

```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
```

---

## 🔗 Related

- **Frontend:** `../salonmind-people/`
- **Docs:** `../RESTRUCTURING_PLAN.md`
- **Comparison:** `../ARCHITECTURE_COMPARISON.md`

---

## 📚 Resources

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

**Status:** Initial Setup - Ready for Restructuring  
**Last Updated:** November 13, 2025
