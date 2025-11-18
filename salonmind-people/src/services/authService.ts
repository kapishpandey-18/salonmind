import { api } from "./api";
import { API_ENDPOINTS } from "../constants/api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  OTPData,
  User,
} from "../types";

export const authService = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data!;
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data!;
  },

  // Send OTP to phone number
  sendOTP: async (phoneNumber: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      { phoneNumber }
    );
    return response.data!;
  },

  // Verify OTP
  verifyOTP: async (otpData: OTPData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      otpData
    );
    return response.data!;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data!;
  },

  // Update profile
  updateProfile: async (data: any): Promise<{ user: User }> => {
    const response = await api.patch<{ user: User }>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return response.data!;
  },

  // Complete onboarding
  completeOnboarding: async (
    data: any
  ): Promise<{ user: User; salon: any }> => {
    const response = await api.post<{ user: User; salon: any }>(
      API_ENDPOINTS.AUTH.COMPLETE_ONBOARDING,
      data
    );
    return response.data!;
  },
};
