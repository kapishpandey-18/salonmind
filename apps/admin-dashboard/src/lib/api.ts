import {
  createApiClient,
  createAuthService,
  createWebTokenStorage,
} from "@salonmind/auth-client";
import type { AdminUser } from "../types/user";
import { ADMIN_AUTH_BASE_PATH, ADMIN_REFRESH_PATH, API_BASE_URL } from "./env";
import { unwrapApiResponse } from "../utils/api";

type UnauthorizedHandler = () => void | Promise<void>;

const tokenStorage = createWebTokenStorage("salonmind-admin");

let unauthorizedHandler: UnauthorizedHandler | null = null;

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  refreshEndpoint: ADMIN_REFRESH_PATH,
  tokenStorage,
  onUnauthorized: async () => {
    await unauthorizedHandler?.();
  },
});

const authService = createAuthService<AdminUser>({
  client: apiClient,
  basePath: ADMIN_AUTH_BASE_PATH,
  tokenStorage,
});

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

export const fetchAdminProfile = async (): Promise<AdminUser> => {
  const response = await apiClient.get(`${ADMIN_AUTH_BASE_PATH}/me`);
  const data = unwrapApiResponse<{ user: AdminUser }>(response.data);
  return data.user ?? ((data as unknown as AdminUser) || null);
};

export { apiClient, authService, tokenStorage };
