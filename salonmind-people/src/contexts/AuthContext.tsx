import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import { STORAGE_KEYS } from "../constants/api";
import type { User, LoginCredentials, RegisterData, OTPData } from "../types";
import { toast } from "sonner";
import { logger } from "../utils/logger";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithOTP: (otpData: OTPData) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
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

          // Try to verify token - but don't fail if backend is down
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(currentUser)
            );
          } catch (error) {
            // Backend not available or token invalid - use stored user for now
            console.log("Could not verify token, using stored user data");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      logger.info("Logging in...", { email: credentials.email });
      const response = await authService.login(credentials);

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      logger.success("Login successful", { userId: response.user.id });
      toast.success("Logged in successfully!");
    } catch (error: any) {
      logger.error("Login failed:", error.message);
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      logger.info("Sending OTP to:", phoneNumber);
      await authService.sendOTP(phoneNumber);
      logger.success("OTP sent successfully");
      toast.success("OTP sent to your phone!");
    } catch (error: any) {
      logger.error("Send OTP failed:", error.message);
      toast.error(error.message || "Failed to send OTP");
      throw error;
    }
  };

  const loginWithOTP = async (otpData: OTPData) => {
    try {
      logger.info("Verifying OTP for:", otpData.phoneNumber);
      const response = await authService.verifyOTP(otpData);

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
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
      await authService.logout();
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const refreshUser = async () => {
    try {
      logger.debug("Refreshing user data...");
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      logger.success("User data refreshed");
    } catch (error) {
      logger.error("Error refreshing user:", error);
      throw error;
    }
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

  const completeOnboarding = async (data: any) => {
    try {
      logger.info("Completing onboarding...");
      const response = await authService.completeOnboarding(data);
      setUser(response.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      logger.success("Onboarding completed");
      toast.success("Welcome to SalonMind!");
    } catch (error: any) {
      logger.error("Onboarding failed:", error.message);
      toast.error(error.message || "Onboarding failed");
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    loginWithOTP,
    sendOTP,
    logout,
    refreshUser,
    updateProfile,
    completeOnboarding,
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
