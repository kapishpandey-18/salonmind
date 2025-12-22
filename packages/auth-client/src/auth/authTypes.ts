export type Surface = "ADMIN" | "SALON_OWNER" | "SALON_EMPLOYEE";

export interface OtpChallengeResponse {
  challengeId: string;
  expiresIn: number;
}

export interface VerifyOtpPayload {
  challengeId: string;
  otp: string;
  phone?: string;
}

export interface AuthResponse<UserShape = any> {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserShape;
}

export interface ApiSuccessResponse<T> {
  success?: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
}

export interface ApiErrorShape {
  message?: string;
  statusCode?: number;
  details?: string[];
}

export interface ApiErrorResponse {
  success?: boolean;
  error?: ApiErrorShape;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
