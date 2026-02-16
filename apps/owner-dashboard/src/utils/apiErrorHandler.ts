import { toast } from 'sonner';
import type { ApiError } from '../types';

// Common error codes and their user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PLAN_LIMIT_EXCEEDED: 'You have reached your plan limit. Please upgrade to continue.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
};

// Status code to error type mapping
const STATUS_CODE_MAP: Record<number, string> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
  500: 'SERVER_ERROR',
  502: 'SERVER_ERROR',
  503: 'SERVER_ERROR',
  504: 'SERVER_ERROR',
};

interface HandleApiErrorOptions {
  showToast?: boolean;
  defaultMessage?: string;
  silent?: boolean;
}

export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle ApiError type
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;

    // Check for specific error code first
    if (apiError.code && ERROR_MESSAGES[apiError.code]) {
      return ERROR_MESSAGES[apiError.code];
    }

    // Check for status code mapping
    if (apiError.statusCode && STATUS_CODE_MAP[apiError.statusCode]) {
      const errorType = STATUS_CODE_MAP[apiError.statusCode];
      // For 403, check if it's a plan limit error
      if (apiError.statusCode === 403 && apiError.code === 'PLAN_LIMIT_EXCEEDED') {
        const limit = apiError.meta?.limit;
        if (typeof limit === 'number') {
          return `Your plan allows up to ${limit} items. Upgrade to add more.`;
        }
      }
      return ERROR_MESSAGES[errorType];
    }

    // Use the error message if available
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error instances
  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions = {}
): string {
  const { showToast = true, defaultMessage, silent = false } = options;

  const message = defaultMessage || getErrorMessage(error);

  if (showToast && !silent) {
    const apiError = error as ApiError;

    // Don't show toast for 401 (handled by auth flow)
    if (apiError?.statusCode === 401) {
      return message;
    }

    // Show appropriate toast variant
    if (apiError?.statusCode === 403 && apiError?.code === 'PLAN_LIMIT_EXCEEDED') {
      toast.warning(message, {
        action: {
          label: 'Upgrade',
          onClick: () => {
            window.location.href = '/settings?tab=billing';
          },
        },
      });
    } else if (apiError?.statusCode && apiError.statusCode >= 500) {
      toast.error(message);
    } else {
      toast.error(message);
    }
  }

  return message;
}

// Hook-friendly error handler for React Query
export function createMutationErrorHandler(options: HandleApiErrorOptions = {}) {
  return (error: unknown) => {
    handleApiError(error, options);
  };
}

// Success toast helper
export function showSuccess(message: string) {
  toast.success(message);
}

// Info toast helper
export function showInfo(message: string) {
  toast.info(message);
}

// Warning toast helper
export function showWarning(message: string) {
  toast.warning(message);
}
