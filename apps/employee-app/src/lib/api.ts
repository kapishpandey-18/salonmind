import {
  createApiClient,
  createAuthService,
  createCapacitorTokenStorage,
} from "@salonmind/auth-client";
import type { EmployeeUser } from "../types/user";
import { EMPLOYEE_AUTH_BASE_PATH, EMPLOYEE_REFRESH_PATH, API_BASE_URL } from "./env";

type UnauthorizedHandler = () => void | Promise<void>;

const tokenStorage = createCapacitorTokenStorage("salon-employee");
let unauthorizedHandler: UnauthorizedHandler | null = null;

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  refreshEndpoint: EMPLOYEE_REFRESH_PATH,
  tokenStorage,
  onUnauthorized: async () => {
    await unauthorizedHandler?.();
  },
});

const authService = createAuthService<EmployeeUser>({
  client: apiClient,
  basePath: EMPLOYEE_AUTH_BASE_PATH,
  tokenStorage,
});

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

export { apiClient, authService, tokenStorage };
