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
