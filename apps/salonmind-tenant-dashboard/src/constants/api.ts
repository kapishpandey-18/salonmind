// API Base URL - will be loaded from environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_OTP: "/v1/auth/salon-owner/otp/send",
    RESEND_OTP: "/v1/auth/salon-owner/otp/resend",
    VERIFY_OTP: "/v1/auth/salon-owner/otp/verify",
    LOGOUT: "/v1/auth/salon-owner/logout",
    REFRESH: "/v1/auth/salon-owner/token/refresh",
    ME: "/v1/auth/salon-owner/me",
    UPDATE_PROFILE: "/v1/auth/salon-owner/update-profile",
    COMPLETE_ONBOARDING: "/v1/auth/salon-owner/complete-onboarding",
  },
  OWNER: {
    ONBOARDING: {
      PROFILE: "/v1/owner/onboarding/profile",
      BUSINESS_HOURS: "/v1/owner/onboarding/business-hours",
      SERVICES: "/v1/owner/onboarding/services",
      STAFF: "/v1/owner/onboarding/staff",
      CHECKOUT: "/v1/owner/onboarding/checkout",
      CONFIRM: "/v1/owner/onboarding/confirm",
    },
    BRANCHES: "/v1/owner/branches",
    ACTIVE_BRANCH: "/v1/owner/branches/active",
    STAFF: "/v1/owner/staff",
    SERVICES: "/v1/owner/services",
    CLIENTS: "/v1/owner/clients",
    APPOINTMENTS: "/v1/owner/appointments",
    CONTEXT: "/v1/owner/me/context",
  },

  // Appointments
  APPOINTMENTS: {
    BASE: "/api/appointments",
    BY_ID: (id: string) => `/api/appointments/${id}`,
    BY_CLIENT: (clientId: string) => `/api/appointments/client/${clientId}`,
    BY_STAFF: (staffId: string) => `/api/appointments/staff/${staffId}`,
    BY_DATE: "/api/appointments/by-date",
    STATS: "/api/appointments/stats",
  },

  // Clients
  CLIENTS: {
    BASE: "/api/clients",
    BY_ID: (id: string) => `/api/clients/${id}`,
    SEARCH: "/api/clients/search",
    STATS: "/api/clients/stats",
    HISTORY: (id: string) => `/api/clients/${id}/history`,
  },

  // Staff
  STAFF: {
    BASE: "/api/staff",
    BY_ID: (id: string) => `/api/staff/${id}`,
    AVAILABILITY: (id: string) => `/api/staff/${id}/availability`,
    STATS: (id: string) => `/api/staff/${id}/stats`,
  },

  // Services
  SERVICES: {
    BASE: "/api/services",
    BY_ID: (id: string) => `/api/services/${id}`,
    BY_CATEGORY: (category: string) => `/api/services/category/${category}`,
    ACTIVE: "/api/services/active",
  },

  // Products
  PRODUCTS: {
    BASE: "/api/products",
    BY_ID: (id: string) => `/api/products/${id}`,
    LOW_STOCK: "/api/products/low-stock",
    BY_CATEGORY: (category: string) => `/api/products/category/${category}`,
  },

  // Inventory
  INVENTORY: {
    BASE: "/api/inventory",
    TRANSACTIONS: "/api/inventory/transactions",
    ADJUST: "/api/inventory/adjust",
  },

  // Revenue & Analytics
  REVENUE: {
    STATS: "/api/revenue/stats",
    ANALYTICS: "/api/revenue/analytics",
    BY_DATE_RANGE: "/api/revenue/by-date-range",
    BY_CATEGORY: "/api/revenue/by-category",
    BY_STAFF: "/api/revenue/by-staff",
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_data",
  ACTIVE_BRANCH_ID: "active_branch_id",
} as const;

// App Constants
export const APP_CONSTANTS = {
  TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds
  REFRESH_TOKEN_EXPIRY: 604800000, // 7 days in milliseconds
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
