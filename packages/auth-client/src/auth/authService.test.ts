import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AxiosInstance } from "axios";
import { createAuthService } from "./authService";
import type { TokenStorage } from "./tokenStorage";

const createTokenStorage = () => {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  return {
    getAccessToken: vi.fn(async () => accessToken),
    getRefreshToken: vi.fn(async () => refreshToken),
    setTokens: vi.fn(async (tokens) => {
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken ?? refreshToken;
    }),
    clearTokens: vi.fn(async () => {
      accessToken = null;
      refreshToken = null;
    }),
  } satisfies TokenStorage;
};

describe("createAuthService", () => {
  const postSpy = vi.fn();
  const mockClient = { post: postSpy } as unknown as AxiosInstance;
  let tokenStorage: TokenStorage;
  let service: ReturnType<typeof createAuthService>;

  beforeEach(() => {
    postSpy.mockReset();
    tokenStorage = createTokenStorage();
    service = createAuthService({
      client: mockClient,
      basePath: "/v1/auth/admin",
      tokenStorage,
    });
  });

  it("sends OTP with sanitized payload", async () => {
    postSpy.mockResolvedValue({ data: { data: { challengeId: "abc", expiresIn: 300000 } } });
    const result = await service.sendOtp("+911234567890");
    expect(postSpy).toHaveBeenCalledWith("/v1/auth/admin/otp/send", { phone: "+911234567890" });
    expect(result.challengeId).toBe("abc");
  });

  it("stores tokens after verifying OTP", async () => {
    postSpy.mockResolvedValueOnce({
      data: {
        data: {
          accessToken: "token",
          refreshToken: "refresh",
          expiresIn: 900000,
          user: { id: "user" },
        },
      },
    });

    await service.verifyOtp({ challengeId: "abc", otp: "123456" });

    expect(postSpy).toHaveBeenCalledWith("/v1/auth/admin/otp/verify", {
      challengeId: "abc",
      otp: "123456",
    });
    expect(tokenStorage.setTokens).toHaveBeenCalledWith({
      accessToken: "token",
      refreshToken: "refresh",
    });
  });

  it("propagates verification errors without storing tokens", async () => {
    const error = new Error("Invalid OTP");
    postSpy.mockRejectedValueOnce(error);

    await expect(service.verifyOtp({ challengeId: "abc", otp: "000000" })).rejects.toThrow("Invalid OTP");
    expect(tokenStorage.setTokens).not.toHaveBeenCalled();
  });

  it("logs out when a refresh token exists", async () => {
    postSpy
      .mockResolvedValueOnce({ data: { data: { accessToken: "token", refreshToken: "refresh", user: {} } } })
      .mockResolvedValueOnce({ data: { success: true } });

    await service.verifyOtp({ challengeId: "abc", otp: "123456" });
    await service.logout();

    expect(postSpy).toHaveBeenLastCalledWith("/v1/auth/admin/logout", {
      refreshToken: "refresh",
    });
  });

  it("skips network logout when no refresh token is stored", async () => {
    await service.logout();
    expect(postSpy).not.toHaveBeenCalled();
  });
});
