import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import { STORAGE_KEYS } from "../constants/api";
import type { User, OTPData, OtpChallengeResponse } from "../types";
import { toast } from "sonner";
import { logger } from "../utils/logger";
import { clearStoredSession } from "../utils/session";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithOTP: (otpData: OTPData) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<OtpChallengeResponse>;
  resendOTP: (challengeId: string) => Promise<OtpChallengeResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const sendOTP = async (
    phoneNumber: string
  ): Promise<OtpChallengeResponse> => {
    try {
      logger.info("Sending OTP to:", phoneNumber);
      const challenge = await authService.sendOTP(phoneNumber);
      logger.success("OTP sent successfully");
      toast.success("OTP sent to your phone!");
      return challenge;
    } catch (error: any) {
      logger.error("Send OTP failed:", error.message);
      toast.error(error.message || "Failed to send OTP");
      throw error;
    }
  };

  const resendOTP = async (
    challengeId: string
  ): Promise<OtpChallengeResponse> => {
    try {
      logger.info("Resending OTP challenge:", challengeId);
      const challenge = await authService.resendOTP(challengeId);
      logger.success("OTP resent successfully");
      toast.success("OTP resent successfully!");
      return challenge;
    } catch (error: any) {
      logger.error("Resend OTP failed:", error.message);
      toast.error(error.message || "Failed to resend OTP");
      throw error;
    }
  };

  const loginWithOTP = async (otpData: OTPData) => {
    try {
      logger.info("Verifying OTP challenge", { challengeId: otpData.challengeId });
      const response = await authService.verifyOTP(otpData);

      setUser(response.user);
      setToken(response.accessToken);

      localStorage.setItem(STORAGE_KEYS.TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      logger.success("OTP verification successful", {
        userId: response.user.id,
      });
      toast.success("Logged in successfully!");
    } catch (error: any) {
      logger.error("OTP verification failed:", error.message);
      toast.error(error.message || "OTP verification failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      logger.info("Logging out...");
      const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (storedRefresh) {
        await authService.logout(storedRefresh);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleLogout();
      toast.success("Logged out successfully");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    clearStoredSession();
  };

  const updateProfile = async (data: any) => {
    try {
      logger.info("Updating profile...");
      const response = await authService.updateProfile(data);
      setUser(response.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      logger.success("Profile updated");
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      logger.error("Update profile failed:", error.message);
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      logger.info("Refreshing user profile...");
      const response = await authService.fetchProfile();
      setUser(response.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      logger.success("Profile refreshed");
    } catch (error: any) {
      logger.error("Refresh user failed:", error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    loginWithOTP,
    sendOTP,
    resendOTP,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
