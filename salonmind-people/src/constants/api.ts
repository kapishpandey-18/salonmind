// API Base URL - will be loaded from environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY_OTP: "/api/auth/verify-otp",
    SEND_OTP: "/api/auth/send-otp",
    ME: "/api/auth/me",
    UPDATE_PROFILE: "/api/auth/update-profile",
    COMPLETE_ONBOARDING: "/api/auth/complete-onboarding",
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
