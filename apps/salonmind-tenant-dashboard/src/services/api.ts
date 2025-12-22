import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import type { ApiError, ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { triggerAppLogoutRedirect } from '../utils/session';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof window !== 'undefined') {
      const branchId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
      const url = config.url || '';
      const isAuthCall = url.includes('/v1/auth/');
      if (branchId && config.headers && !isAuthCall) {
        config.headers['X-Branch-Id'] = branchId;
      }
    }
    
    // Log API request
    logger.apiRequest(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      config.data
    );
    
    // Store request start time
    (config as any).requestStartTime = Date.now();
    
    return config;
  },
  (error: AxiosError) => {
    logger.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = Date.now() - ((response.config as any).requestStartTime || Date.now());
    
    // Log API response
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      duration,
      response.data
    );
    
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Calculate request duration
    const duration = Date.now() - ((originalRequest as any).requestStartTime || Date.now());
    
    // Log error response
    logger.apiResponse(
      originalRequest.method?.toUpperCase() || 'GET',
      originalRequest.url || '',
      error.response?.status || 0,
      duration,
      error.response?.data
    );
    
    logger.error('API Error:', error.message, error.response?.data);

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      if (originalRequest._retry) {
        triggerAppLogoutRedirect();
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          triggerAppLogoutRedirect();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        triggerAppLogoutRedirect();
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Generic API request helper
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}

// Helper methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'GET', url });
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'POST', url, data });
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'PUT', url, data });
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'PATCH', url, data });
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'DELETE', url });
  },
};

export default apiClient;
