# SalonMind User Flows - Figma Design Guide

## 🎯 App Architecture Overview

### 1. Customer App (Mobile - React Native/Capacitor)

**Target Users:** Salon clients who want to book services

**Core Flows:**

```
1. Discovery & Onboarding
   Landing → Browse Salons Nearby → View Salon Profile → Sign Up

2. Booking Flow
   Home → Search Services → Select Service → Choose Staff → Pick Time → Confirm → Payment

3. Profile & History
   Profile → Past Appointments → Favorite Salons → Reviews → Loyalty Points

4. Notifications
   Appointment Reminders → Offers → New Services
```

**Key Screens (20-25 screens):**

- Splash Screen
- Onboarding (3 slides)
- Login/Sign Up (OTP-based)
- Home (Nearby salons, Featured services)
- Salon Details (Services, Staff, Reviews, Gallery)
- Service Selection
- Staff Selection
- Date & Time Picker
- Booking Summary
- Payment
- Booking Confirmation
- My Appointments (Upcoming, Past)
- Appointment Details
- Profile Settings
- Favorites
- Wallet/Loyalty Points
- Notifications
- Reviews & Ratings
- Search & Filters

---

### 2. Staff App (Mobile - React Native/Capacitor)

**Target Users:** Salon staff members (stylists, beauticians)

**Core Flows:**

```
1. Daily Work
   Login → Today's Schedule → View Appointment → Start Service → Mark Complete → Add Notes

2. Client Management
   Clients List → Client Profile → Service History → Add Private Notes

3. Earnings & Stats
   Today's Earnings → Weekly Stats → Commission Breakdown → Tips Received
```

**Key Screens (15-18 screens):**

- Login (Phone + PIN/OTP)
- Dashboard/Today's Schedule
- Appointment Card (Detailed view)
- Client Check-in
- Service Timer
- Service Notes (Products used, observations)
- Mark Complete
- Client List
- Client Profile
- Client History
- Earnings Dashboard
- Weekly Stats
- Commission Details
- Profile Settings
- Notifications
- Leave Request
- Availability Settings

---

### 3. Salon Owner App/WebApp (Web + Mobile - What you're building)

**Target Users:** Salon owners managing their business

**Core Flows:**

```
1. Onboarding (CURRENT)
   Sign Up OTP → Verify → Onboarding (8 steps) → Dashboard

2. Daily Operations
   Dashboard → Today's Appointments → Staff Status → Walk-in Booking → Quick Actions

3. Staff Management
   Staff List → Add Staff → Assign Services → Set Commission → Schedule Management

4. Client Management
   Clients → View Profile → Booking History → Loyalty Points → Send Offers

5. Services & Products
   Services → Add/Edit → Pricing → Staff Assignment
   Products → Inventory → Stock Alerts → Purchase Orders

6. Reports & Analytics
   Revenue Dashboard → Service Performance → Staff Performance → Client Analytics

7. Settings
   Business Settings → Operating Hours → Pricing → Notifications → Integrations
```

**Key Screens (40-50 screens):**

**Current Screens (You have):**

- ✅ Login (Email/Password + OTP)
- ✅ Onboarding (8 steps)
- ✅ Dashboard (Overview cards, stats)
- ✅ Staff Management
- ✅ Products Management
- ❌ Services (needs design)
- ❌ Appointments (needs design)
- ❌ Clients (needs design)
- ❌ Analytics (needs design)

**Missing Screens to Design:**

- Appointments Calendar View
- Appointments List View
- Create New Appointment
- Appointment Details
- Walk-in Booking (Quick)
- Services List
- Add/Edit Service
- Service Categories
- Clients List (Table + Cards)
- Client Profile (Detailed)
- Client Booking History
- Client Analytics
- Add Client
- Send Notification to Clients
- Analytics Dashboard
- Revenue Reports
- Staff Performance
- Service Performance
- Client Retention Analytics
- Settings (Multiple tabs)
- Business Profile
- Operating Hours
- Payment Settings
- Notification Settings
- Subscription & Billing
- Help & Support

---

### 4. SalonMind Internal Portal (Web - Admin)

**Target Users:** Your internal team managing the platform

**Core Flows:**

```
1. Salon Management
   All Salons → View Details → Edit → Suspend/Activate → View Stats

2. Subscription Management
   Plans → Pricing → Trial Management → Payment Tracking → Invoicing

3. Support & Help
   Support Tickets → Chat → Salon Queries → Analytics

4. Platform Analytics
   Total Revenue → Active Salons → Growth Metrics → Feature Usage
```

**Key Screens (25-30 screens):**

- Super Admin Login
- Dashboard (Platform-wide metrics)
- Salons List (All registered salons)
- Salon Details (Complete profile, stats)
- Salon Analytics
- Edit Salon
- Subscription Plans Management
- Create/Edit Plan
- Billing & Invoices
- Payment Transactions
- Support Tickets
- Live Chat
- User Management (Admin roles)
- Platform Settings
- Feature Flags
- Email Templates
- SMS Templates
- Notification Settings
- Analytics Reports
- Revenue Dashboard
- Growth Metrics
- Feature Usage
- Audit Logs
- System Health

---

## 🎨 Design Priorities (Based on Your Current Progress)

### **Immediate Priority (Week 1-2): Salon Owner App**

You already have the foundation. Complete these screens first:

#### High Priority:

1. **Appointments Module** (Most Critical)
   - Calendar View (Week/Day/Month)
   - Appointment List
   - Create/Edit Appointment
   - Walk-in Quick Booking

2. **Services Module**
   - Services List
   - Add/Edit Service
   - Service Categories
   - Pricing & Duration

3. **Clients Module**
   - Clients List (Search, Filters)
   - Client Profile
   - Booking History
   - Add Client

#### Medium Priority:

4. **Analytics Dashboard**
   - Revenue Charts
   - Staff Performance
   - Service Performance
   - Client Analytics

5. **Settings**
   - Business Profile
   - Operating Hours
   - Notification Preferences

### **Next Priority (Week 3-4): Staff App**

Simpler, focused on daily tasks

### **Future Priority (Month 2): Customer App**

Consumer-facing, needs polish

### **Final Priority (Month 3): Internal Portal**

Your internal tool, can be functional-first

---

## 🔧 Figma Workspace Setup (Action Items)

### Day 1 Tasks:

1. **Create Main Figma File**

   ```
   File Name: "SalonMind - Complete Design System"
   ```

2. **Set Up Pages:**
   - Page 1: Design System
   - Page 2: Salon Owner App (Web)
   - Page 3: Salon Owner App (Mobile)
   - Page 4: Staff App (Mobile)
   - Page 5: Customer App (Mobile)
   - Page 6: Internal Portal (Web)

3. **Create Design System Components:**
   - Colors (Variables)
   - Text Styles
   - Button Variants
   - Input Fields
   - Cards
   - Navigation
   - Icons Set

4. **Import Current UI:**
   - Take screenshots of your current Dashboard, Staff, Products
   - Place them in Figma as reference
   - Trace and componentize

---

## 📱 Responsive Design Strategy

### Breakpoints (Match Capacitor apps):

```
Mobile:    320px - 767px   (Staff App, Customer App)
Tablet:    768px - 1023px  (Salon Owner iPad)
Desktop:   1024px - 1920px (Salon Owner Web)
Large:     1920px+         (Internal Portal)
```

### Capacitor Considerations:

- iOS Safe Areas (notch)
- Android navigation bars
- Bottom tab navigation for mobile apps
- Side navigation for web apps
- Consistent components across platforms

---

## 🎯 Your Next Actions (Step-by-Step)

### Today (2-3 hours):

1. ✅ Create Figma account/project
2. ✅ Set up pages and structure
3. ✅ Create color palette (use existing dark blue theme)
4. ✅ Import current screenshots for reference

### Tomorrow (4-6 hours):

1. ✅ Design **Appointments Calendar** (Most important)
2. ✅ Design **Appointment List View**
3. ✅ Design **Create Appointment** modal/page
4. ✅ Design **Services List** page

### This Week:

1. Complete all Salon Owner App screens
2. Create component library
3. Test responsive layouts

### Week 2:

1. Start Staff App designs
2. Focus on mobile-first
3. Test flows

---

## 🤝 Design Handoff Process

When designs are ready:

1. **Export from Figma:**
   - Use Figma Dev Mode
   - Get CSS/Tailwind specs
   - Export assets (SVG icons, images)

2. **Build with Current Stack:**
   - Use shadcn/ui components
   - Apply Tailwind classes
   - Match colors from design system

3. **Iterate:**
   - Compare side-by-side
   - Adjust as needed
   - Test on real devices (Capacitor)

---

## 📚 Resources for Inspiration

**Similar App Designs:**

- Fresha (Salon booking app)
- StyleSeat (Salon management)
- Booksy (Appointments)
- Square Appointments
- Zenoti (Enterprise salon software)

**Design Systems to Study:**

- Shadcn UI (you're using this)
- Radix UI
- Tailwind UI
- Material Design 3

---

## 🚀 Immediate Next Step

Want me to help you create:

1. **Appointments Calendar screen** design specs?
2. **Services Management** screen specs?
3. **Client Profile** screen specs?

Or should I help you set up the Figma project structure first?

Let me know which screen you want to tackle first! 🎨
