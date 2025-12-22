import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AdminUser } from "../../types/user";
import { authService, fetchAdminProfile, registerUnauthorizedHandler, tokenStorage } from "../../lib/api";
import type { OtpChallengeResponse } from "@salonmind/auth-client";

interface VerifyPayload {
  challengeId: string;
  otp: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  sendOtp: (phone: string) => Promise<OtpChallengeResponse>;
  resendOtp: (challengeId: string) => Promise<OtpChallengeResponse>;
  verifyOtp: (payload: VerifyPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const profileQueryKey = ["admin", "profile"] as const;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [sessionExpired, setSessionExpired] = useState(false);

  const syncUser = useCallback(
    (nextUser: AdminUser | null) => {
      setUser(nextUser);
      if (nextUser) {
        queryClient.setQueryData(profileQueryKey, nextUser);
      } else {
        queryClient.removeQueries({ queryKey: profileQueryKey });
      }
    },
    [queryClient]
  );

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      setSessionExpired(true);
      setStatus("unauthenticated");
      syncUser(null);
      await tokenStorage.clearTokens();
    });
  }, [syncUser]);

  useEffect(() => {
    const bootstrapSession = async () => {
      const storedToken = await tokenStorage.getAccessToken();
      if (!storedToken) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const profile = await fetchAdminProfile();
        syncUser(profile);
        setSessionExpired(false);
        setStatus("authenticated");
      } catch (error) {
        await tokenStorage.clearTokens();
        syncUser(null);
        setStatus("unauthenticated");
      }
    };

    bootstrapSession();
  }, [syncUser]);

  const sendOtp = useCallback(async (phone: string) => {
    return authService.sendOtp(phone);
  }, []);

  const resendOtp = useCallback(async (challengeId: string) => {
    return authService.resendOtp(challengeId);
  }, []);

  const verifyOtp = useCallback(async ({ challengeId, otp }: VerifyPayload) => {
    const result = await authService.verifyOtp({ challengeId, otp });
    syncUser(result.user as AdminUser);
    setStatus("authenticated");
    setSessionExpired(false);
  }, [syncUser]);

  const logout = useCallback(async () => {
    await authService.logout();
    await tokenStorage.clearTokens();
    syncUser(null);
    setSessionExpired(false);
    setStatus("unauthenticated");
  }, [syncUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: status === "authenticated" && Boolean(user),
      isLoading: status === "checking",
      sessionExpired,
      sendOtp,
      resendOtp,
      verifyOtp,
      logout,
    }),
    [logout, resendOtp, sendOtp, sessionExpired, status, user, verifyOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
