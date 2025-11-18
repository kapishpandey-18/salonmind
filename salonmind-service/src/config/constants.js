/**
 * Application constants and configurations
 */

// User roles
const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
  CLIENT: "client",
};

// Appointment statuses
const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
};

// Client statuses
const CLIENT_STATUS = {
  NEW: "new",
  ACTIVE: "active",
  VIP: "vip",
  INACTIVE: "inactive",
};

// Service categories
const SERVICE_CATEGORIES = {
  HAIRCUT: "Haircut",
  COLORING: "Coloring",
  STYLING: "Styling",
  TREATMENT: "Treatment",
  FACIAL: "Facial",
  MASSAGE: "Massage",
  NAIL: "Nail",
  MAKEUP: "Makeup",
  OTHER: "Other",
};

// Product categories
const PRODUCT_CATEGORIES = {
  HAIR_CARE: "Hair Care",
  SKIN_CARE: "Skin Care",
  TOOLS: "Tools",
  EQUIPMENT: "Equipment",
  ACCESSORIES: "Accessories",
  OTHER: "Other",
};

// Payment methods
const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  UPI: "upi",
  WALLET: "wallet",
  OTHER: "other",
};

// Business hours days
const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Token expiry
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "7d",
  REFRESH_TOKEN: "30d",
  OTP: 5 * 60 * 1000, // 5 minutes in milliseconds
};

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  CLIENT_STATUS,
  SERVICE_CATEGORIES,
  PRODUCT_CATEGORIES,
  PAYMENT_METHODS,
  DAYS_OF_WEEK,
  PAGINATION,
  TOKEN_EXPIRY,
};
