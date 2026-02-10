export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
  CLIENT: "client",
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
} as const;

export const CLIENT_STATUS = {
  NEW: "new",
  ACTIVE: "active",
  VIP: "vip",
  INACTIVE: "inactive",
} as const;

export const SERVICE_CATEGORIES = {
  HAIRCUT: "Haircut",
  COLORING: "Coloring",
  STYLING: "Styling",
  TREATMENT: "Treatment",
  FACIAL: "Facial",
  MASSAGE: "Massage",
  NAIL: "Nail",
  MAKEUP: "Makeup",
  OTHER: "Other",
} as const;

export const PRODUCT_CATEGORIES = {
  HAIR_CARE: "Hair Care",
  SKIN_CARE: "Skin Care",
  TOOLS: "Tools",
  EQUIPMENT: "Equipment",
  ACCESSORIES: "Accessories",
  OTHER: "Other",
} as const;

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  UPI: "upi",
  WALLET: "wallet",
  OTHER: "other",
} as const;

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "7d",
  REFRESH_TOKEN: "30d",
  OTP: 5 * 60 * 1000,
} as const;
