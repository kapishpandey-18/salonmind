// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  role:
    | "admin"
    | "staff"
    | "client"
    | "owner"
    | "manager"
    | "ADMIN"
    | "SALON_OWNER"
    | "SALON_EMPLOYEE";
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isOnboarded?: boolean;
  salon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
}

export interface OTPData {
  challengeId: string;
  otp: string;
}

export interface OtpChallengeResponse {
  challengeId: string;
  expiresIn: number;
}

// Client Types
export type ClientStatus = "vip" | "active" | "new" | "inactive";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
  status: ClientStatus;
  address?: string;
  notes?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment Types
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Appointment {
  id: string;
  clientId: string;
  client: Client;
  staffId: string;
  staff: Staff;
  serviceId: string;
  service: Service;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId: string;
  staffId: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}

// Staff Types
export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string[];
  avatar?: string;
  rating: number;
  completedAppointments: number;
  availability: StaffAvailability[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  retailPrice?: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryTransaction {
  id: string;
  productId: string;
  product: Product;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason?: string;
  performedBy: string;
  createdAt: string;
}

// Revenue Types
export interface RevenueStats {
  today: number;
  week: number;
  month: number;
  year: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface RevenueByCategory {
  category: string;
  amount: number;
  count: number;
}

export interface RevenueAnalytics {
  stats: RevenueStats;
  byCategory: RevenueByCategory[];
  byStaff: { staffId: string; staffName: string; amount: number }[];
  byService: {
    serviceId: string;
    serviceName: string;
    amount: number;
    count: number;
  }[];
  chartData: { date: string; revenue: number }[];
}

// Onboarding Types
export interface SalonData {
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  businessType: string;
  numberOfStaff: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error Type
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
