# 📮 Postman Testing Guide for SalonMind APIs

## 🚀 Quick Start - Import Collection

### Step 1: Open Postman

1. Launch the Postman app you just downloaded
2. You should see the main workspace

### Step 2: Import the Collection

**Method 1: Drag & Drop**

1. Locate the file: `SalonMind_API_Collection.postman_collection.json`
2. Drag and drop it into Postman window
3. Done! ✅

**Method 2: Import Button**

1. Click the **"Import"** button (top left corner)
2. Click **"Upload Files"**
3. Navigate to: `/Volumes/Work/KridAI/products/salonmind/salonmind-service/`
4. Select: `SalonMind_API_Collection.postman_collection.json`
5. Click **"Import"**
6. Done! ✅

### Step 3: Verify Import

You should now see:

- **Collections** tab (left sidebar)
- **SalonMind API Collection** folder with:
  - Health & Status (1 request)
  - Authentication (9 requests)
  - Salons (5 requests)

---

## 🧪 Testing Workflow

### Test Sequence (Follow this order):

#### 1️⃣ **Health Check** (No auth required)

```
GET http://localhost:5000/health
```

**Steps:**

1. Expand **"Health & Status"** folder
2. Click **"Health Check"**
3. Click **"Send"** button (blue button)
4. Check response (should say "Server is running")

**Expected Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-13T..."
}
```

---

#### 2️⃣ **Register User** (Creates account + Auto-saves token)

```
POST http://localhost:5000/api/auth/register
```

**Steps:**

1. Click **"Register User"** under Authentication
2. Click **"Body"** tab (you'll see the JSON data)
3. **Change the email** (use unique email like: `test123@salonmind.com`)
4. Click **"Send"**

**What Happens:**

- ✅ User account created
- ✅ Token automatically saved to collection variable
- ✅ You're now authenticated!

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**💡 Magic:** The collection has a script that automatically saves your token, so you don't have to copy-paste it!

---

#### 3️⃣ **Get Current User** (Tests if token works)

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer {{token}}
```

**Steps:**

1. Click **"Get Current User"**
2. Click **"Headers"** tab
3. Notice: `Authorization: Bearer {{token}}` (automatically uses saved token!)
4. Click **"Send"**

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test123@salonmind.com",
    "isOnboarded": false,
    ...
  }
}
```

---

#### 4️⃣ **Send OTP** (For phone-based auth)

```
POST http://localhost:5000/api/auth/send-otp
```

**Steps:**

1. Click **"Send OTP"**
2. Check Body - phone number is already filled
3. Click **"Send"**
4. **IMPORTANT:** Copy the OTP code from response!

**Expected Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otp": "384729"  ← Copy this!
  }
}
```

---

#### 5️⃣ **Verify OTP**

```
POST http://localhost:5000/api/auth/verify-otp
```

**Steps:**

1. Click **"Verify OTP"**
2. Click **"Body"** tab
3. Replace `"123456"` with the OTP from previous step
4. Click **"Send"**

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": { "isOnboarded": false, ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

---

#### 6️⃣ **Complete Onboarding** (Creates salon!)

```
POST http://localhost:5000/api/auth/complete-onboarding
```

**Steps:**

1. Click **"Complete Onboarding"**
2. Click **"Body"** tab (all data pre-filled)
3. Optional: Customize salon name, address, etc.
4. Click **"Send"**

**What Happens:**

- ✅ Salon created in database
- ✅ User role changed to "owner"
- ✅ isOnboarded set to true
- ✅ Salon ID saved to collection variable

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "isOnboarded": true,
      "role": "owner",
      ...
    },
    "salon": {
      "id": "673b...",
      "name": "Elegant Beauty Salon",
      ...
    }
  }
}
```

---

#### 7️⃣ **Get All Salons**

```
GET http://localhost:5000/api/salons
```

**Steps:**

1. Click **"Get All Salons"** under Salons folder
2. Click **"Send"**
3. Should see the salon created in step 6

**Expected Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673b...",
      "name": "Elegant Beauty Salon",
      "owner": { ... },
      ...
    }
  ]
}
```

---

#### 8️⃣ **Update Profile**

```
PATCH http://localhost:5000/api/auth/update-profile
```

**Steps:**

1. Click **"Update Profile"**
2. Modify firstName, lastName, etc. in Body
3. Click **"Send"**

---

#### 9️⃣ **Get Salon by ID**

```
GET http://localhost:5000/api/salons/{{salonId}}
```

**Steps:**

1. Click **"Get Salon by ID"**
2. Notice the URL uses `{{salonId}}` (auto-filled!)
3. Click **"Send"**

---

## 🔑 Understanding Variables

The collection uses **variables** to make testing easier:

### Collection Variables (Auto-managed):

- `{{baseUrl}}` = `http://localhost:5000`
- `{{token}}` = Your JWT access token (auto-saved after login/register)
- `{{refreshToken}}` = Your refresh token
- `{{userId}}` = Your user ID
- `{{salonId}}` = Salon ID (auto-saved after onboarding)

### How to View Variables:

1. Click on **"SalonMind API Collection"** (the collection name)
2. Click **"Variables"** tab
3. You'll see all saved values

---

## 🎯 Pro Tips

### 1. Test Scripts (Auto-save tokens)

Each request has a **"Tests"** tab with JavaScript code that:

- Saves tokens automatically
- Saves IDs automatically
- Logs important info to console

### 2. Check Console

- Click **"Console"** (bottom left icon)
- See all requests, responses, and logs
- Great for debugging!

### 3. Save Requests

After modifying a request:

- Click **Save** (Cmd+S)
- Your changes persist

### 4. Duplicate Requests

- Right-click any request
- Click **"Duplicate"**
- Create variations for testing

### 5. Environment vs Collection Variables

- **Collection Variables**: Used in this collection (easier for beginners)
- **Environments**: For switching between dev/staging/prod

---

## 🐛 Common Issues & Solutions

### Issue 1: "Could not get any response"

**Solution:**

- ✅ Check if backend is running: `curl http://localhost:5000/health`
- ✅ Restart backend: `pkill -f "node.*server.js" && cd /Volumes/Work/KridAI/products/salonmind/salonmind-service && node src/server.js &`

### Issue 2: "Not authorized, no token"

**Solution:**

- ✅ Run "Register User" or "Login with Email" first
- ✅ Token should auto-save, check Variables tab
- ✅ Verify Header has: `Authorization: Bearer {{token}}`

### Issue 3: "User with this email already exists"

**Solution:**

- ✅ Change the email in request body
- ✅ Or use "Login with Email" instead

### Issue 4: "Salon not found"

**Solution:**

- ✅ Run "Complete Onboarding" first
- ✅ Check if `{{salonId}}` variable is set

---

## 📊 Testing Checklist

Use this checklist to ensure everything works:

- [ ] Health Check returns success
- [ ] Register creates user + saves token
- [ ] Get Current User returns user data
- [ ] Send OTP returns OTP code
- [ ] Verify OTP logs in user
- [ ] Complete Onboarding creates salon
- [ ] Get All Salons shows created salon
- [ ] Update Profile changes user data
- [ ] Get Salon by ID returns salon details
- [ ] Login with Email works (after registering)

---

## 🎥 Visual Guide

### Where is what in Postman?

```
┌─────────────────────────────────────────────────────────┐
│  [Import]  [New]  [Runner]         [Search]   [Save]   │  ← Top Bar
├────────────┬────────────────────────────────────────────┤
│            │  GET http://localhost:5000/health          │  ← URL Bar
│ Collections│  [Params] [Headers] [Body] [Tests]         │  ← Tabs
│            ├────────────────────────────────────────────┤
│ ├─ Health  │                                            │
│ ├─ Auth    │     Request Body / Response                │  ← Main Area
│ │  ├─ Reg  │                                            │
│ │  ├─ Log  │                                            │
│ │  └─ OTP  │                                            │
│ └─ Salons  │                                            │
│            │                                            │
│            │  Status: 200 OK   Time: 45ms   Size: 123B │  ← Response Info
└────────────┴────────────────────────────────────────────┘
  ↑                                                       ↑
Sidebar                                         [Send Button]
```

---

## 🎉 You're Ready!

Now you can:

1. Import the collection ✅
2. Test all 15 API endpoints ✅
3. See automatic token management ✅
4. Build new APIs with confidence ✅

**Happy Testing! 🚀**

---

## 📞 Need Help?

- Check backend logs: `tail -f /tmp/salonmind-backend.log`
- Run test script: `cd /Volumes/Work/KridAI/products/salonmind/salonmind-service && ./test-apis.sh`
- See full API docs: `API_TESTS.md`
