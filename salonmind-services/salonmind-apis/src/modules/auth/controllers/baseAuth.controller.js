const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const authService = require("../services/auth.service");

const extractMeta = (req) => ({
  ip: req.ip,
  userAgent: req.get("user-agent"),
});

const buildController = (surface) => {
  const sendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const data = await authService.initiateOtp({
      phone,
      surface,
      meta: extractMeta(req),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "OTP challenge created"));
  });

  const resendOtp = asyncHandler(async (req, res) => {
    const { challengeId } = req.body;
    const data = await authService.resendOtp({ challengeId, surface });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "OTP challenge resent"));
  });

  const verifyOtp = asyncHandler(async (req, res) => {
    const { challengeId, otp } = req.body;
    const data = await authService.verifyOtp({
      challengeId,
      otp,
      surface,
      meta: extractMeta(req),
    });
    return res.status(200).json(new ApiResponse(200, data, "OTP verified"));
  });

  const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const data = await authService.refreshTokens({
      refreshToken,
      surface,
      ip: req.ip,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Token refreshed successfully"));
  });

  const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout({ refreshToken, surface });
    return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
  });

  return {
    sendOtp,
    resendOtp,
    verifyOtp,
    refreshToken,
    logout,
  };
};

module.exports = buildController;
