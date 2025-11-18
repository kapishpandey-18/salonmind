# SalonMind API Testing Guide

## 🛠️ Testing Tools Recommendations

### **Best Options:**

1. **Postman** (Most Popular)
   - Download: https://www.postman.com/downloads/
   - ✅ Beautiful UI, Collections, Environment Variables
   - ✅ Auto-generate documentation
   - ✅ Team collaboration features
   - ✅ Import/Export collections

2. **Thunder Client** (VS Code Extension)
   - Install in VS Code: Search "Thunder Client"
   - ✅ Built into VS Code (no need to switch apps)
   - ✅ Lightweight and fast
   - ✅ Git-friendly (save collections as JSON)
   - ✅ Perfect for quick testing

3. **Insomnia**
   - Download: https://insomnia.rest/download
   - ✅ Clean interface
   - ✅ GraphQL support
   - ✅ Good for API design

4. **cURL** (Command Line)
   - Already installed on Mac/Linux
   - ✅ Quick and scriptable
   - ✅ Great for CI/CD
   - ❌ Not as user-friendly

---

## 🧪 API Test Suite

### Base URL

```
http://localhost:5000
```

---

## 1️⃣ Health Check

### Check Server Status

```bash
curl http://localhost:5000/health
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-13T11:37:25.893Z"
}
```

---

## 2️⃣ Authentication APIs

### A. Register User (Email/Password)

**Endpoint:** `POST /api/auth/register`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@salonmind.com",
    "password": "Test@12345",
    "phoneNumber": "+919876543210",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "owner@salonmind.com",
      "phoneNumber": "+919876543210",
      "role": "client",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "isOnboarded": false,
      "salon": null,
      "createdAt": "2025-11-13T...",
      "updatedAt": "2025-11-13T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Save the `token` for next requests!**

---

### B. Login with Email/Password

**Endpoint:** `POST /api/auth/login`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@salonmind.com",
    "password": "Test@12345"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  },
  "message": "Login successful"
}
```

---

### C. Send OTP (for OTP-based signup/login)

**Endpoint:** `POST /api/auth/send-otp`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210"
  }'
```

**Expected Response (Development Mode):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otp": "384729"
  }
}
```

**📝 Note:** OTP is visible in development mode. In production, it will be sent via SMS.

---

### D. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "384729"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "phoneNumber": "+919876543210",
      "email": "user_+919876543210@temp.com",
      "role": "client",
      "isOnboarded": false,
      ...
    },
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  },
  "message": "OTP verified successfully"
}
```

---

### E. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Request:**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "owner@salonmind.com",
    "phoneNumber": "+919876543210",
    "role": "client",
    "firstName": "John",
    "lastName": "Doe",
    "isOnboarded": false,
    "salon": null,
    ...
  }
}
```

---

### F. Update Profile (Protected)

**Endpoint:** `PATCH /api/auth/update-profile`

**Request:**

```bash
curl -X PATCH http://localhost:5000/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "https://example.com/avatar.jpg",
      ...
    }
  },
  "message": "Profile updated successfully"
}
```

---

### G. Complete Onboarding (Protected)

**Endpoint:** `POST /api/auth/complete-onboarding`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/complete-onboarding \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@salonmind.com",
    "salonName": "Elegant Beauty Salon",
    "salonAddress": "123 Main Street",
    "salonCity": "Mumbai",
    "salonState": "Maharashtra",
    "salonZipCode": "400001",
    "salonCountry": "India",
    "salonPhoneNumber": "+919876543210",
    "salonEmail": "contact@elegantsalon.com",
    "businessHours": [
      { "day": "monday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "tuesday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "wednesday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "thursday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "friday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "saturday", "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
      { "day": "sunday", "isOpen": false, "openTime": "09:00", "closeTime": "18:00" }
    ],
    "currency": "INR",
    "timezone": "Asia/Kolkata"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "john@salonmind.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "owner",
      "isOnboarded": true,
      "salon": "673b1234567890abcdef1234"
    },
    "salon": {
      "id": "673b1234567890abcdef1234",
      "name": "Elegant Beauty Salon",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "phoneNumber": "+919876543210",
      "email": "contact@elegantsalon.com"
    }
  },
  "message": "Onboarding completed successfully"
}
```

---

### H. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### I. Logout (Protected)

**Endpoint:** `POST /api/auth/logout`

**Request:**

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 3️⃣ Salon APIs (Protected)

### A. Create Salon

**Endpoint:** `POST /api/salons`

**Request:**

```bash
curl -X POST http://localhost:5000/api/salons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Hair Studio",
    "address": "456 Park Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India",
    "phoneNumber": "+919988776655",
    "email": "info@premiumstudio.com",
    "businessHours": [
      { "day": "monday", "isOpen": true, "openTime": "10:00", "closeTime": "20:00" }
    ],
    "settings": {
      "currency": "INR",
      "timezone": "Asia/Kolkata"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Premium Hair Studio",
    "owner": "...",
    "address": "456 Park Avenue",
    "city": "Delhi",
    ...
  },
  "message": "Salon created successfully"
}
```

---

### B. Get All Salons (for current user)

**Endpoint:** `GET /api/salons`

**Request:**

```bash
curl http://localhost:5000/api/salons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "Elegant Beauty Salon",
      "owner": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@salonmind.com"
      },
      ...
    }
  ]
}
```

---

### C. Get Single Salon by ID

**Endpoint:** `GET /api/salons/:id`

**Request:**

```bash
curl http://localhost:5000/api/salons/SALON_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "SALON_ID_HERE",
    "name": "Elegant Beauty Salon",
    "owner": { ... },
    "address": "123 Main Street",
    ...
  }
}
```

---

### D. Update Salon

**Endpoint:** `PUT /api/salons/:id`

**Request:**

```bash
curl -X PUT http://localhost:5000/api/salons/SALON_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elegant Beauty & Spa",
    "phoneNumber": "+919876543211"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "SALON_ID_HERE",
    "name": "Elegant Beauty & Spa",
    "phoneNumber": "+919876543211",
    ...
  },
  "message": "Salon updated successfully"
}
```

---

### E. Delete Salon

**Endpoint:** `DELETE /api/salons/:id`

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/salons/SALON_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Salon deleted successfully"
}
```

---

## 🧪 Testing Workflow

### **Recommended Test Sequence:**

```bash
# 1. Health Check
curl http://localhost:5000/health

# 2. Register a new user
# Save the token from response

# 3. Get current user profile
# Use the token from step 2

# 4. Send OTP to a phone number
# Note the OTP from response

# 5. Verify OTP
# This creates/logs in user via phone

# 6. Complete onboarding
# This creates salon and marks user as onboarded

# 7. Get all salons
# Should show the salon created in step 6

# 8. Update profile
# Change user details

# 9. Logout
```

---

## 📦 Postman Collection

Want a ready-to-use Postman collection? I can create one with:

- All endpoints pre-configured
- Environment variables for token
- Example requests and responses
- Automated tests

---

## 🐛 Common Errors

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**Fix:** Add Authorization header with valid token

### 400 Bad Request

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Fix:** Use a different email or login with existing one

### 404 Not Found

```json
{
  "success": false,
  "message": "Route not found"
}
```

**Fix:** Check the endpoint URL

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error creating salon"
}
```

**Fix:** Check backend logs: `tail -f /tmp/salonmind-backend.log`

---

## 📊 Current API Count

✅ **8 Auth Endpoints**
✅ **5 Salon Endpoints**
**Total: 13 APIs Built**

**Remaining: ~40+ APIs for full app**

- Clients CRUD (6+ endpoints)
- Appointments CRUD (8+ endpoints)
- Services CRUD (6+ endpoints)
- Products/Inventory (8+ endpoints)
- Dashboard Analytics (5+ endpoints)
- Staff Management (6+ endpoints)

---

## 🚀 Next Steps

1. Install **Thunder Client** in VS Code OR **Postman**
2. Test all auth endpoints
3. Test salon endpoints
4. Move to building Clients CRUD APIs
5. Then Appointments, Services, etc.
