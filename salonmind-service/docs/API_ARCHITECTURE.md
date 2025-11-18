# SalonMind API Architecture & Design Patterns

## 🏗️ Architecture Pattern

**Type:** RESTful + Multi-tenant + RBAC (Role-Based Access Control)

### Core Principles:

1. **Resource-based URLs** - Each entity is a resource
2. **HTTP Methods** - GET, POST, PUT/PATCH, DELETE
3. **Multi-tenancy** - Salon-scoped data isolation
4. **Role-based access** - Owner, Manager, Staff, Client
5. **Consistent response format** - Standard JSON structure
6. **Middleware pattern** - Auth, validation, error handling
7. **Service layer** - Business logic separation
8. **Repository pattern** - Database abstraction

---

## 📁 Project Structure (Best Practice)

```
salonmind-service/
├── src/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Salon.js
│   │   ├── Appointment.js
│   │   ├── Client.js
│   │   ├── Service.js
│   │   ├── Product.js
│   │   └── index.js         # Export all models
│   │
│   ├── controllers/         # Request handlers (thin)
│   │   ├── authController.js
│   │   ├── appointmentsController.js
│   │   ├── clientsController.js
│   │   ├── servicesController.js
│   │   ├── productsController.js
│   │   ├── revenueController.js
│   │   └── dashboardController.js
│   │
│   ├── services/            # Business logic (fat)
│   │   ├── appointmentService.js
│   │   ├── clientService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   └── analyticsService.js
│   │
│   ├── routes/              # Route definitions
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   ├── clients.js
│   │   ├── services.js
│   │   ├── products.js
│   │   ├── revenue.js
│   │   └── index.js         # Route aggregator
│   │
│   ├── middleware/          # Middleware functions
│   │   ├── auth.js          # JWT verification
│   │   ├── validate.js      # Request validation
│   │   ├── roleCheck.js     # Role-based access
│   │   ├── salonAccess.js   # Multi-tenant isolation
│   │   ├── errorHandler.js  # Global error handling
│   │   └── rateLimiter.js   # Rate limiting
│   │
│   ├── validators/          # Input validation schemas
│   │   ├── appointmentValidator.js
│   │   ├── clientValidator.js
│   │   └── serviceValidator.js
│   │
│   ├── utils/               # Helper functions
│   │   ├── logger.js
│   │   ├── asyncHandler.js
│   │   ├── ApiError.js
│   │   └── ApiResponse.js
│   │
│   ├── config/              # Configuration
│   │   ├── database.js
│   │   ├── constants.js
│   │   └── permissions.js
│   │
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.js
│
├── package.json
└── .env
```

---

## 🔐 Multi-Tenant Data Isolation Pattern

### Strategy: **Salon-scoped Queries**

Every API request automatically filters by salon:

```javascript
// Middleware: salonAccess.js
const ensureSalonAccess = async (req, res, next) => {
  const user = req.user;

  // Get user's salon
  const salonId = user.salon || req.params.salonId;

  // Verify user has access to this salon
  if (user.role === "owner" || user.role === "manager") {
    req.salonId = salonId;
  } else if (user.role === "staff") {
    // Staff can only access their assigned salon
    if (user.salon.toString() !== salonId) {
      throw new ApiError(403, "Access denied to this salon");
    }
    req.salonId = salonId;
  }

  next();
};
```

**Usage in Controllers:**

```javascript
// All queries automatically scoped to salon
const appointments = await Appointment.find({
  salon: req.salonId, // ← Automatic salon isolation
  date: req.query.date,
});
```

---

## 🎯 Complete API Endpoints Design

### Base URL: `http://localhost:5000/api/v1`

---

## 1️⃣ **Authentication APIs** (Already Built ✅)

```
POST   /auth/register              - Register with email/password
POST   /auth/login                 - Login with email/password
POST   /auth/send-otp              - Send OTP to phone
POST   /auth/verify-otp            - Verify OTP & login/register
GET    /auth/me                    - Get current user
PATCH  /auth/update-profile        - Update user profile
POST   /auth/complete-onboarding   - Complete onboarding & create salon
POST   /auth/refresh               - Refresh access token
POST   /auth/logout                - Logout user
```

**Access:** Public (except me, update-profile, complete-onboarding, logout)

---

## 2️⃣ **Salon APIs** (Already Built ✅)

```
GET    /salons                     - Get all salons (owner sees their salons)
GET    /salons/:id                 - Get salon by ID
POST   /salons                     - Create new salon
PUT    /salons/:id                 - Update salon
DELETE /salons/:id                 - Delete salon
```

**Access:** Owner, Manager

---

## 3️⃣ **Appointments APIs** (Priority 1 - Build Now)

```
# Core CRUD
GET    /appointments                           - List all appointments
GET    /appointments/:id                       - Get appointment details
POST   /appointments                           - Create new appointment
PUT    /appointments/:id                       - Update appointment
DELETE /appointments/:id                       - Cancel appointment

# Specialized Endpoints
GET    /appointments/calendar                  - Calendar view (date range)
GET    /appointments/today                     - Today's appointments
GET    /appointments/upcoming                  - Upcoming appointments
POST   /appointments/:id/complete              - Mark as completed
POST   /appointments/:id/no-show               - Mark as no-show
POST   /appointments/:id/reschedule            - Reschedule appointment
POST   /appointments/check-availability        - Check staff availability
GET    /appointments/staff/:staffId            - Get staff's appointments
```

**Query Params:**

```
?date=2025-11-13              - Filter by date
?startDate=&endDate=          - Date range
?status=confirmed             - Filter by status
?staffId=123                  - Filter by staff
?clientId=456                 - Filter by client
?page=1&limit=20              - Pagination
```

**Access:** Owner, Manager, Staff (own appointments only)

---

## 4️⃣ **Clients APIs** (Priority 2)

```
# Core CRUD
GET    /clients                               - List all clients
GET    /clients/:id                           - Get client details
POST   /clients                               - Add new client
PUT    /clients/:id                           - Update client
DELETE /clients/:id                           - Delete client

# Specialized Endpoints
GET    /clients/search                        - Search clients (name, phone, email)
GET    /clients/:id/appointments              - Client's appointment history
GET    /clients/:id/stats                     - Client statistics
POST   /clients/:id/notes                     - Add client note
GET    /clients/vip                           - Get VIP clients
POST   /clients/:id/send-notification         - Send notification to client
```

**Query Params:**

```
?search=john                  - Search by name/phone/email
?status=vip                   - Filter by status
?sort=totalSpent              - Sort by field
?page=1&limit=20              - Pagination
```

**Access:** Owner, Manager, Staff (read-only)

---

## 5️⃣ **Services APIs** (Priority 3)

```
# Core CRUD
GET    /services                              - List all services
GET    /services/:id                          - Get service details
POST   /services                              - Create new service
PUT    /services/:id                          - Update service
DELETE /services/:id                          - Delete service

# Specialized Endpoints
GET    /services/categories                   - Get all categories
GET    /services/category/:category           - Services by category
GET    /services/staff/:staffId               - Services offered by staff
POST   /services/:id/assign-staff             - Assign staff to service
GET    /services/popular                      - Most booked services
```

**Query Params:**

```
?category=Haircut             - Filter by category
?active=true                  - Only active services
?staffId=123                  - Services by staff
```

**Access:** Owner, Manager

---

## 6️⃣ **Products/Inventory APIs** (Priority 4)

```
# Core CRUD
GET    /products                              - List all products
GET    /products/:id                          - Get product details
POST   /products                              - Create new product
PUT    /products/:id                          - Update product
DELETE /products/:id                          - Delete product

# Inventory Management
GET    /products/low-stock                    - Products below threshold
POST   /products/:id/adjust-stock             - Adjust stock quantity
GET    /products/categories                   - Product categories
GET    /products/:id/usage-history            - Product usage history
POST   /products/bulk-import                  - Bulk import products
```

**Query Params:**

```
?category=HairCare            - Filter by category
?lowStock=true                - Low stock items
?search=shampoo               - Search products
```

**Access:** Owner, Manager

---

## 7️⃣ **Staff APIs** (Enhance existing)

```
# Core CRUD
GET    /staff                                 - List all staff
GET    /staff/:id                             - Get staff details
POST   /staff                                 - Add new staff member
PUT    /staff/:id                             - Update staff
DELETE /staff/:id                             - Remove staff

# Specialized Endpoints
GET    /staff/:id/schedule                    - Staff schedule
GET    /staff/:id/appointments                - Staff appointments
GET    /staff/:id/performance                 - Performance metrics
POST   /staff/:id/availability                - Set availability
GET    /staff/available                       - Available staff now
```

**Access:** Owner, Manager

---

## 8️⃣ **Revenue/Analytics APIs** (Priority 5)

```
# Dashboard Stats
GET    /analytics/dashboard                   - Overview stats
GET    /analytics/revenue                     - Revenue analytics
GET    /analytics/revenue/daily               - Daily revenue
GET    /analytics/revenue/monthly             - Monthly revenue
GET    /analytics/revenue/by-service          - Revenue by service
GET    /analytics/revenue/by-staff            - Revenue by staff

# Performance Metrics
GET    /analytics/appointments/stats          - Appointment statistics
GET    /analytics/clients/retention           - Client retention rate
GET    /analytics/services/popular            - Popular services
GET    /analytics/staff/performance           - Staff performance
GET    /analytics/trends                      - Business trends
```

**Query Params:**

```
?startDate=2025-01-01         - Date range start
?endDate=2025-12-31           - Date range end
?period=monthly               - Grouping period
```

**Access:** Owner, Manager

---

## 9️⃣ **Dashboard APIs** (Quick Stats)

```
GET    /dashboard/overview                    - Today's overview
GET    /dashboard/quick-stats                 - Quick statistics
GET    /dashboard/recent-activity             - Recent activities
GET    /dashboard/upcoming                    - Upcoming appointments
GET    /dashboard/alerts                      - Important alerts
```

**Access:** Owner, Manager, Staff

---

## 🔒 Role-Based Access Control (RBAC)

### Permission Matrix:

| Resource     | Owner | Manager | Staff  | Client |
| ------------ | ----- | ------- | ------ | ------ |
| Salon        | CRUD  | Read    | Read   | -      |
| Appointments | CRUD  | CRUD    | Read\* | CRUD\* |
| Clients      | CRUD  | CRUD    | Read   | Read\* |
| Services     | CRUD  | CRUD    | Read   | Read   |
| Products     | CRUD  | CRUD    | Read   | -      |
| Staff        | CRUD  | CRUD    | Read\* | -      |
| Revenue      | Read  | Read    | Read\* | -      |
| Settings     | CRUD  | Read    | -      | -      |

**Legend:**

- `*` = Own data only
- `CRUD` = Create, Read, Update, Delete
- `Read` = Read-only access

### Implementation:

```javascript
// middleware/roleCheck.js
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Insufficient permissions");
    }
    next();
  };
};

// Usage in routes:
router.post(
  "/appointments",
  authenticate,
  ensureSalonAccess,
  requireRole("owner", "manager", "staff"),
  createAppointment
);
```

---

## 📦 Standard Response Format

### Success Response:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response:

```json
{
  "success": false,
  "error": {
    "code": "APPOINTMENT_NOT_FOUND",
    "message": "Appointment not found",
    "details": []
  }
}
```

### Pagination Format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🛡️ Middleware Chain Pattern

```javascript
// Typical route with full middleware chain
router.post(
  "/appointments",
  authenticate, // 1. Verify JWT token
  ensureSalonAccess, // 2. Check salon access
  requireRole("owner", "manager"), // 3. Check role
  validateRequest(appointmentSchema), // 4. Validate input
  asyncHandler(createAppointment) // 5. Handle request
);
```

---

## 🔄 Service Layer Pattern

**Controllers (Thin)** - Handle HTTP, validation, responses
**Services (Fat)** - Handle business logic

```javascript
// ❌ Bad: Business logic in controller
const createAppointment = async (req, res) => {
  // Check conflicts
  const existingAppointment = await Appointment.findOne({...});
  if (existingAppointment) throw new Error('Conflict');

  // Calculate end time
  const service = await Service.findById(req.body.serviceId);
  const endTime = addMinutes(startTime, service.duration);

  // Send notification
  await sendNotification(...);

  // Create appointment
  const appointment = await Appointment.create({...});

  res.json({ success: true, data: appointment });
};

// ✅ Good: Thin controller, fat service
const createAppointment = async (req, res) => {
  const appointment = await appointmentService.createAppointment(
    req.body,
    req.user,
    req.salonId
  );

  res.json({ success: true, data: appointment });
};

// services/appointmentService.js
const createAppointment = async (data, user, salonId) => {
  // All business logic here
  await checkConflicts(data);
  const endTime = calculateEndTime(data);
  await sendNotification(data);
  return await Appointment.create({ ...data, salon: salonId });
};
```

---

## 🎯 Query Optimization Patterns

### 1. **Populate Related Data:**

```javascript
const appointments = await Appointment.find({ salon: salonId })
  .populate("client", "name phone email")
  .populate("service", "name duration price")
  .populate("staff", "firstName lastName")
  .lean(); // Use lean() for read-only queries (faster)
```

### 2. **Pagination:**

```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
  Appointment.find(query).skip(skip).limit(limit),
  Appointment.countDocuments(query),
]);
```

### 3. **Aggregation for Analytics:**

```javascript
const revenue = await Appointment.aggregate([
  { $match: { salon: salonId, status: "completed" } },
  {
    $group: {
      _id: "$service",
      total: { $sum: "$price" },
      count: { $sum: 1 },
    },
  },
  { $sort: { total: -1 } },
]);
```

---

## 🔍 Search & Filter Pattern

```javascript
// Build dynamic query
const buildQuery = (filters, salonId) => {
  const query = { salon: salonId };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  return query;
};

// Usage:
const query = buildQuery(req.query, req.salonId);
const results = await Model.find(query);
```

---

## 📊 Error Handling Pattern

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details: err.details || [],
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};
```

---

## 🧪 Testing Pattern

```javascript
// tests/integration/appointments.test.js
describe("Appointments API", () => {
  let token, salonId;

  beforeAll(async () => {
    // Setup: Create user, login, get token
    const user = await createTestUser();
    token = await loginUser(user);
    salonId = user.salon;
  });

  describe("POST /appointments", () => {
    it("should create appointment", async () => {
      const res = await request(app)
        .post("/api/v1/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          /* appointment data */
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
    });

    it("should prevent double booking", async () => {
      // Test conflict detection
    });
  });
});
```

---

## 🚀 API Versioning Strategy

```
Current: /api/v1/*
Future:  /api/v2/*

Both versions can coexist:
- v1 routes → Old implementation
- v2 routes → New implementation
```

---

## 📝 API Documentation (Auto-generate with Swagger)

```javascript
// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SalonMind API",
      version: "1.0.0",
      description: "Salon Management System API",
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

// Use in app.js:
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 🎯 Priority Order for Building APIs:

1. **Appointments** (Core feature - most important)
2. **Clients** (Required for appointments)
3. **Services** (Required for appointments)
4. **Staff** (Enhance existing)
5. **Products/Inventory**
6. **Revenue/Analytics**
7. **Dashboard** (Aggregates all data)

---

## 📚 Recommended NPM Packages:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.2"
  }
}
```

---

## ✅ Summary

**Best Patterns for SalonMind:**

1. ✅ RESTful API design
2. ✅ Multi-tenant data isolation
3. ✅ Role-based access control
4. ✅ Service layer separation
5. ✅ Middleware chain pattern
6. ✅ Standard response format
7. ✅ Query optimization
8. ✅ Error handling
9. ✅ API versioning
10. ✅ Comprehensive testing

**This architecture will:**

- Scale to thousands of salons
- Maintain data isolation
- Provide fine-grained access control
- Be easy to test and maintain
- Follow industry best practices
