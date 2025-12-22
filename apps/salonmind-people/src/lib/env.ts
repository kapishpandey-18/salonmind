export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5009";

export const EMPLOYEE_AUTH_BASE_PATH = "/v1/auth/salon-employee";
export const EMPLOYEE_REFRESH_PATH = `${EMPLOYEE_AUTH_BASE_PATH}/token/refresh`;
