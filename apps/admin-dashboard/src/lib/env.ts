export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5009";

export const ADMIN_AUTH_BASE_PATH = "/v1/auth/admin";
export const ADMIN_REFRESH_PATH = `${ADMIN_AUTH_BASE_PATH}/token/refresh`;
