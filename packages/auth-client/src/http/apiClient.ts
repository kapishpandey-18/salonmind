import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { TokenStorage } from "../auth/tokenStorage";
import type { ApiResponse, AuthResponse } from "../auth/authTypes";

interface ApiClientConfig {
  baseURL: string;
  refreshEndpoint: string;
  tokenStorage: TokenStorage;
  onUnauthorized?: () => void | Promise<void>;
}

type RetriableRequest = AxiosRequestConfig & { _retry?: boolean };

const extractAuthPayload = <T>(payload: ApiResponse<T>): T => {
  if (payload && "data" in payload && payload.data) {
    return payload.data;
  }
  return (payload as unknown as T) || ({} as T);
};

export const createApiClient = ({
  baseURL,
  refreshEndpoint,
  tokenStorage,
  onUnauthorized,
}: ApiClientConfig): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  const refreshClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  const refreshTokens = async () => {
    const storedRefresh = await tokenStorage.getRefreshToken();
    if (!storedRefresh) {
      throw new Error("Missing refresh token");
    }
    const response = await refreshClient.post(refreshEndpoint, {
      refreshToken: storedRefresh,
    });
    const data = extractAuthPayload<AuthResponse>(response.data);
    await tokenStorage.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data.accessToken;
  };

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse<AuthResponse>>) => {
      const originalRequest = error.config as RetriableRequest;
      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;
        try {
          const nextAccessToken = await refreshTokens();
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${nextAccessToken}`,
          };
          return client(originalRequest);
        } catch (refreshError) {
          await tokenStorage.clearTokens();
          await onUnauthorized?.();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};
