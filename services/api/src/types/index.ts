import type { Types } from "mongoose";

export type Surface = "ADMIN" | "SALON_OWNER" | "SALON_EMPLOYEE";

export type UserRole =
  | "owner"
  | "manager"
  | "staff"
  | "client"
  | "ADMIN"
  | "SALON_OWNER"
  | "SALON_EMPLOYEE";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type TenantAppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ClientStatus = "new" | "active" | "vip" | "inactive";

export type TenantClientStatus = "vip" | "active" | "new";

export type PaymentMethod = "cash" | "card" | "upi" | "wallet" | "other";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type SubscriptionStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export type TenantStatus = "PENDING" | "ACTIVE";

export type OtpChallengeStatus = "ACTIVE" | "USED" | "LOCKED";

export type StaffStatus = "active" | "off";

export interface SurfaceConfig {
  accessTtlMs: number;
  refreshTtlMs: number;
}

export interface EnvConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  otpTtlMs: number;
  otpMaxAttempts: number;
  otpMaxResends: number;
  surfaces: Record<Surface, SurfaceConfig>;
  adminAllowlist: string[];
}

export interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  surface: Surface;
  tokenType: "ACCESS";
  iat: number;
  exp?: number;
}

export interface SanitizedUser {
  id: Types.ObjectId;
  phoneNumber?: string;
  role: UserRole;
  tenant?: Types.ObjectId;
  activeBranch?: Types.ObjectId;
  isActive: boolean;
  isOnboarded: boolean;
  isProfileComplete: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RequestMeta {
  ip: string;
  userAgent: string;
}

export interface OtpChallengeResult {
  challengeId: string;
  expiresIn: number;
  _testOtp?: string;
}

export interface AuthTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SanitizedUser;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}
