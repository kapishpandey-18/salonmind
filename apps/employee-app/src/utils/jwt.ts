export interface TokenClaims {
  sub: string;
  sessionId?: string;
  surface?: string;
  [key: string]: unknown;
}

const base64UrlDecode = (segment: string) => {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  const padded = normalized + "=".repeat(padding);
  if (typeof globalThis.atob !== "function") {
    throw new Error("Cannot decode token payload in this environment");
  }
  const decoded = globalThis.atob(padded);
  try {
    return decodeURIComponent(Array.from(decoded)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""));
  } catch {
    return decoded;
  }
};

export const decodeTokenClaims = (token: string | null) => {
  if (!token) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;
  try {
    const payload = base64UrlDecode(segments[1]);
    return JSON.parse(payload) as TokenClaims;
  } catch (_error) {
    return null;
  }
};
