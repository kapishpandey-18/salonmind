import type { AxiosInstance } from "axios";
import type {
  ApiResponse,
  AuthResponse,
  OtpChallengeResponse,
  VerifyOtpPayload,
} from "./authTypes";
import type { TokenStorage } from "./tokenStorage";

const extractData = <T>(payload: ApiResponse<T>): T => {
  if (payload && "data" in payload && payload.data) {
    return payload.data;
  }
  return (payload as unknown as T) || ({} as T);
};

interface AuthServiceOptions {
  client: AxiosInstance;
  basePath: string;
  tokenStorage: TokenStorage;
}

export const createAuthService = <UserShape = any>({
  client,
  basePath,
  tokenStorage,
}: AuthServiceOptions) => {
  const buildUrl = (path: string) => `${basePath}${path}`;

  return {
    async sendOtp(phone: string): Promise<OtpChallengeResponse> {
      const response = await client.post(buildUrl("/otp/send"), { phone });
      return extractData<OtpChallengeResponse>(response.data);
    },
    async resendOtp(challengeId: string): Promise<OtpChallengeResponse> {
      const response = await client.post(buildUrl("/otp/resend"), {
        challengeId,
      });
      return extractData<OtpChallengeResponse>(response.data);
    },
    async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse<UserShape>> {
      const response = await client.post(buildUrl("/otp/verify"), {
        challengeId: payload.challengeId,
        otp: payload.otp,
      });
      const data = extractData<AuthResponse<UserShape>>(response.data);
      await tokenStorage.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data;
    },
    async logout(): Promise<void> {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          await client.post(buildUrl("/logout"), { refreshToken });
        } catch (error) {
          // Swallow logout network errors so UI can still clear local session
        }
      }
      await tokenStorage.clearTokens();
    },
  };
};
