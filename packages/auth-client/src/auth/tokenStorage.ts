import { Preferences } from "@capacitor/preferences";
import { Buffer } from "buffer";

export interface TokenPair {
  accessToken: string;
  refreshToken?: string | null;
}

export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: TokenPair): Promise<void>;
  clearTokens(): Promise<void>;
}

/**
 * SECURITY NOTICE:
 *
 * Token storage strategy affects security posture significantly:
 *
 * 1. localStorage (createWebTokenStorage):
 *    - Persists across browser sessions
 *    - VULNERABLE to XSS attacks - any script can read tokens
 *    - Use only for low-security applications or when httpOnly cookies aren't feasible
 *
 * 2. sessionStorage (createSecureWebTokenStorage):
 *    - Clears when tab closes - better for sensitive apps
 *    - Still vulnerable to XSS, but reduces exposure window
 *    - Recommended for web apps that can't use httpOnly cookies
 *
 * 3. Memory only (createMemoryTokenStorage):
 *    - Most secure against XSS (tokens not in DOM storage)
 *    - Clears on page refresh - poor UX
 *    - Best for high-security single-page apps
 *
 * 4. Capacitor Preferences (createCapacitorTokenStorage):
 *    - Uses native secure storage on mobile devices
 *    - Recommended for mobile apps
 *
 * BEST PRACTICE: Use httpOnly cookies set by backend for refresh tokens.
 * This requires backend changes but provides the best security.
 */

const encodeValue = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  if (Buffer) {
    return Buffer.from(value, "utf-8").toString("base64");
  }
  return value;
};

const decodeValue = (value: string) => {
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(value);
  }
  if (Buffer) {
    return Buffer.from(value, "base64").toString("utf-8");
  }
  return value;
};

const withNamespace = (namespace: string, key: string) => `${namespace}:${key}`;

const createSafeLocalStorage = (): Storage | null => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
};

const createSafeSessionStorage = (): Storage | null => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  return window.sessionStorage;
};

/**
 * Creates a localStorage-based token storage.
 *
 * WARNING: localStorage is vulnerable to XSS attacks.
 * Consider using createSecureWebTokenStorage or httpOnly cookies instead.
 *
 * @param namespace - Prefix for storage keys (default: "salonmind")
 * @deprecated Prefer createSecureWebTokenStorage for better security
 */
export const createWebTokenStorage = (namespace = "salonmind"): TokenStorage => {
  const storage = createSafeLocalStorage();
  const accessKey = withNamespace(namespace, "accessToken");
  const refreshKey = withNamespace(namespace, "refreshToken");

  return {
    async getAccessToken() {
      return storage?.getItem(accessKey) ?? null;
    },
    async getRefreshToken() {
      return storage?.getItem(refreshKey) ?? null;
    },
    async setTokens(tokens) {
      if (!storage) return;
      storage.setItem(accessKey, tokens.accessToken);
      if (tokens.refreshToken) {
        storage.setItem(refreshKey, tokens.refreshToken);
      }
    },
    async clearTokens() {
      storage?.removeItem(accessKey);
      storage?.removeItem(refreshKey);
    },
  };
};

/**
 * Creates a more secure web token storage using sessionStorage for access tokens
 * and memory for refresh tokens.
 *
 * - Access tokens: sessionStorage (clears on tab close)
 * - Refresh tokens: Memory only (clears on refresh, most secure)
 *
 * This provides better security than localStorage while maintaining
 * reasonable UX for single-tab usage.
 *
 * @param namespace - Prefix for storage keys (default: "salonmind")
 */
export const createSecureWebTokenStorage = (namespace = "salonmind"): TokenStorage => {
  const sessionStore = createSafeSessionStorage();
  const accessKey = withNamespace(namespace, "accessToken");

  // Refresh token stored in memory only - more secure
  let refreshTokenInMemory: string | null = null;

  return {
    async getAccessToken() {
      return sessionStore?.getItem(accessKey) ?? null;
    },
    async getRefreshToken() {
      return refreshTokenInMemory;
    },
    async setTokens(tokens) {
      if (sessionStore) {
        sessionStore.setItem(accessKey, tokens.accessToken);
      }
      if (tokens.refreshToken) {
        refreshTokenInMemory = tokens.refreshToken;
      }
    },
    async clearTokens() {
      sessionStore?.removeItem(accessKey);
      refreshTokenInMemory = null;
    },
  };
};

/**
 * Creates a Capacitor-based token storage for mobile apps.
 * Uses native secure storage provided by the platform.
 *
 * @param namespace - Prefix for storage keys (default: "salonmind")
 */
export const createCapacitorTokenStorage = (namespace = "salonmind"): TokenStorage => {
  const accessKey = withNamespace(namespace, "accessToken");
  const refreshKey = withNamespace(namespace, "refreshToken");

  return {
    async getAccessToken() {
      const { value } = await Preferences.get({ key: accessKey });
      return value ? decodeValue(value) : null;
    },
    async getRefreshToken() {
      const { value } = await Preferences.get({ key: refreshKey });
      return value ? decodeValue(value) : null;
    },
    async setTokens(tokens) {
      await Preferences.set({ key: accessKey, value: encodeValue(tokens.accessToken) });
      if (tokens.refreshToken) {
        await Preferences.set({ key: refreshKey, value: encodeValue(tokens.refreshToken) });
      }
    },
    async clearTokens() {
      await Preferences.remove({ key: accessKey });
      await Preferences.remove({ key: refreshKey });
    },
  };
};

/**
 * Creates an in-memory token storage.
 * Most secure against XSS but tokens are lost on page refresh.
 *
 * Best for:
 * - High-security applications
 * - Single-page apps where refresh isn't common
 * - Testing environments
 */
export const createMemoryTokenStorage = (): TokenStorage => {
  const state: Record<string, string | null> = {
    accessToken: null,
    refreshToken: null,
  };

  return {
    async getAccessToken() {
      return state.accessToken;
    },
    async getRefreshToken() {
      return state.refreshToken;
    },
    async setTokens(tokens) {
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken ?? state.refreshToken;
    },
    async clearTokens() {
      state.accessToken = null;
      state.refreshToken = null;
    },
  };
};

/**
 * Default export: Returns the recommended storage based on environment.
 * - Mobile (Capacitor): Uses native secure storage
 * - Web: Uses secure sessionStorage + memory hybrid
 */
export const createDefaultTokenStorage = (namespace = "salonmind"): TokenStorage => {
  // Check if running in Capacitor environment
  const isCapacitor = typeof (globalThis as any).Capacitor !== "undefined";

  if (isCapacitor) {
    return createCapacitorTokenStorage(namespace);
  }

  // Default to secure web storage for browser environments
  return createSecureWebTokenStorage(namespace);
};
