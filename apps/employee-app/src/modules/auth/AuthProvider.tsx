import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { OtpChallengeResponse } from "@salonmind/auth-client";
import type { EmployeeUser } from "../../types/user";
import { authService, registerUnauthorizedHandler, tokenStorage } from "../../lib/api";
import { decodeTokenClaims } from "../../utils/jwt";
import type { TokenClaims } from "../../utils/jwt";

interface VerifyPayload {
  challengeId: string;
  otp: string;
}

interface AuthContextValue {
  user: EmployeeUser | null;
  tokenClaims: TokenClaims | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  acknowledgeSessionExpiry: () => void;
  sendOtp: (phone: string) => Promise<OtpChallengeResponse>;
  resendOtp: (challengeId: string) => Promise<OtpChallengeResponse>;
  verifyOtp: (payload: VerifyPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [tokenClaims, setTokenClaims] = useState<TokenClaims | null>(null);
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
    setTokenClaims(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      setSessionExpired(true);
      await clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    const bootstrapSession = async () => {
      const storedToken = await tokenStorage.getAccessToken();
      if (!storedToken) {
        setStatus("unauthenticated");
        return;
      }
      const claims = decodeTokenClaims(storedToken);
      if (!claims) {
        await clearSession();
        return;
      }
      setTokenClaims(claims);
      setUser((prev) => {
        if (prev) return prev;
        return {
          id: claims.sub,
          role: claims.surface ?? "SALON_EMPLOYEE",
          phoneNumber: "",
        };
      });
      setSessionExpired(false);
      setStatus("authenticated");
    };

    bootstrapSession();
  }, [clearSession]);

  const sendOtp = useCallback(async (phone: string) => authService.sendOtp(phone), []);

  const resendOtp = useCallback(async (challengeId: string) => authService.resendOtp(challengeId), []);

  const verifyOtp = useCallback(
    async ({ challengeId, otp }: VerifyPayload) => {
      const result = await authService.verifyOtp({ challengeId, otp });
      setUser(result.user as EmployeeUser);
      const claims = decodeTokenClaims(result.accessToken);
      setTokenClaims(claims);
      setSessionExpired(false);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    await clearSession();
    setSessionExpired(false);
  }, [clearSession]);

  const acknowledgeSessionExpiry = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokenClaims,
      isAuthenticated: status === "authenticated",
      isLoading: status === "checking",
      sessionExpired,
      acknowledgeSessionExpiry,
      sendOtp,
      resendOtp,
      verifyOtp,
      logout,
    }),
    [acknowledgeSessionExpiry, logout, resendOtp, sendOtp, sessionExpired, status, tokenClaims, user, verifyOtp]
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
