import type { Request, Response, RequestHandler } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import * as authService from "../services/auth.service.js";
import type { Surface } from "../../../types/index.js";

const extractMeta = (req: Request) => ({
  ip: req.ip || "",
  userAgent: req.get("user-agent") || "",
});

export interface AuthController {
  sendOtp: RequestHandler;
  resendOtp: RequestHandler;
  verifyOtp: RequestHandler;
  refreshToken: RequestHandler;
  logout: RequestHandler;
  [key: string]: RequestHandler;
}

const buildController = (surface: Surface): AuthController => {
  const sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body as { phone: string };
    const data = await authService.initiateOtp({
      phone,
      surface,
      meta: extractMeta(req),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "OTP challenge created"));
  });

  const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId } = req.body as { challengeId: string };
    const data = await authService.resendOtp({ challengeId, surface });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "OTP challenge resent"));
  });

  const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { challengeId, otp } = req.body as {
      challengeId: string;
      otp: string;
    };
    const data = await authService.verifyOtp({
      challengeId,
      otp,
      surface,
      meta: extractMeta(req),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "OTP verified"));
  });

  const refreshToken = asyncHandler(
    async (req: Request, res: Response) => {
      const { refreshToken } = req.body as { refreshToken: string };
      const data = await authService.refreshTokens({
        refreshToken,
        surface,
        ip: req.ip,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, data, "Token refreshed successfully")
        );
    }
  );

  const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout({ refreshToken, surface });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logout successful"));
  });

  return {
    sendOtp,
    resendOtp,
    verifyOtp,
    refreshToken,
    logout,
  };
};

export default buildController;
