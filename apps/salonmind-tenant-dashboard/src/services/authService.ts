import { api } from "./api";
import { API_ENDPOINTS } from "../constants/api";
import type {
  AuthResponse,
  OTPData,
  OtpChallengeResponse,
  User,
} from "../types";

export const authService = {
  // Send OTP to phone number
  sendOTP: async (phoneNumber: string): Promise<OtpChallengeResponse> => {
    const response = await api.post<OtpChallengeResponse>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      { phone: phoneNumber }
    );
    return response.data!;
  },

  // Resend OTP (rotates challenge)
  resendOTP: async (
    challengeId: string
  ): Promise<OtpChallengeResponse> => {
    const response = await api.post<OtpChallengeResponse>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      { challengeId }
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

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  // Update profile
  updateProfile: async (data: any): Promise<{ user: User }> => {
    const response = await api.patch<{ user: User }>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return response.data!;
  },

  // Fetch profile
  fetchProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
    return response.data!;
  },
};
