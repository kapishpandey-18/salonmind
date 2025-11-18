# SalonMind 💇‍♀️

> Transform your salon business with AI

A comprehensive salon management SaaS platform designed specifically for Indian salons. Built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## ✨ Features

- 📊 **Overview Dashboard** - Analytics and key metrics at a glance
- 📅 **Appointments Management** - Calendar integration for scheduling
- 👥 **Client Database** - Comprehensive client management system
- 👨‍💼 **Staff Management** - Performance tracking and scheduling
- 💼 **Services Catalog** - Manage all salon services and pricing
- 💰 **Revenue Analytics** - Detailed financial insights
- 📦 **Inventory Management** - Track stock levels and supplies
- 🛍️ **Products Management** - Retail product catalog
- ⚙️ **Profile Settings** - Salon and user settings
- ❓ **Help & Support** - Built-in assistance

## 🎨 Design

- Rose gold, blush pink, and lavender color scheme
- Rose-50/pink-50/purple-50 gradient background
- Purple to rose gradient sidebar
- Responsive design for mobile and desktop
- Custom SalonMind logo with dual-concept design

## 🇮🇳 India-Specific Features

- Currency displayed in rupees (₹)
- Indian state selection
- PIN code support
- Phone number validation for Indian numbers (+91)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** or **yarn** package manager

### Installation

1. **Clone or download the project**

2. **Install dependencies**

   Using npm:
   \`\`\`bash
   npm install
   \`\`\`

   Using yarn:
   \`\`\`bash
   yarn install
   \`\`\`

3. **Start the development server**

   Using npm:
   \`\`\`bash
   npm run dev
   \`\`\`

   Using yarn:
   \`\`\`bash
   yarn dev
   \`\`\`

4. **Open your browser**

   The application will be running at:
   \`\`\`
   http://localhost:5173
   \`\`\`

### Build for Production

Using npm:
\`\`\`bash
npm run build
\`\`\`

Using yarn:
\`\`\`bash
yarn build
\`\`\`

The built files will be in the \`dist\` directory.

### Preview Production Build

Using npm:
\`\`\`bash
npm run preview
\`\`\`

Using yarn:
\`\`\`bash
yarn preview
\`\`\`

## 🔐 Demo Credentials

### Sign In - Email/Password
- **Email:** demo@salonmind.com
- **Password:** demo123

### Sign In/Sign Up - OTP
- **Phone:** Any 10-digit number starting with 6-9
- **OTP:** 123456

## 📁 Project Structure

\`\`\`
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
├── index.html                 # HTML template
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── Login.tsx              # Authentication component
│   ├── Onboarding.tsx         # New user onboarding flow
│   ├── SalonMindLogo.tsx      # Custom logo component
│   ├── Overview.tsx           # Dashboard overview
│   ├── Appointments.tsx       # Appointments management
│   ├── Clients.tsx            # Client database
│   ├── Staff.tsx              # Staff management
│   ├── Services.tsx           # Services catalog
│   ├── Revenue.tsx            # Revenue analytics
│   ├── Inventory.tsx          # Inventory management
│   ├── Products.tsx           # Products management
│   ├── ProfileSettings.tsx    # Settings page
│   ├── Help.tsx               # Help & support
│   └── ui/                    # shadcn/ui components
├── styles/
│   └── globals.css            # Global styles and Tailwind config
└── guidelines/
    └── Guidelines.md          # Development guidelines
\`\`\`

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI component library
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **Sonner** - Toast notifications

## 📱 User Flows

### New User Registration
1. Sign Up → Phone Number Entry
2. OTP Verification
3. 8-step Onboarding Process
   - Welcome
   - Salon Name
   - Salon Type
   - Location (State + City + PIN)
   - Contact Details
   - Services Selection
   - Create Login Credentials (Email/Password)
   - Success
4. Access Dashboard

### Existing User Login
**Option 1: Email/Password**
- Enter email and password
- Access dashboard directly

**Option 2: OTP**
- Enter phone number
- Verify OTP
- Access dashboard directly

## 🎯 Core Functionality

- **Dual Authentication System** - Email/Password and OTP-based login
- **Comprehensive Onboarding** - 8-step setup for new salons
- **Analytics Dashboard** - Real-time business insights
- **Appointment Scheduling** - Calendar view with booking management
- **Client Management** - Track client history and preferences
- **Staff Performance** - Monitor employee metrics
- **Revenue Tracking** - Detailed financial analytics
- **Inventory Control** - Stock management with alerts
- **Service Catalog** - Complete service pricing and management

## 🔒 Security Features

- OTP-based phone verification
- Secure credential storage
- Session management
- Protected routes

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please use the Help section within the application.

---

**Built with ❤️ for Indian Salon Owners**
