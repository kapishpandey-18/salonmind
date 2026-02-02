const router = require("express").Router();
const adminController = require("../controllers/adminAuth.controller");
const {
  otpSendLimiter,
  otpVerifyLimiter,
  tokenRefreshLimiter,
  generalAuthLimiter,
} = require("../../../middleware/rateLimiter");

router.post("/otp/send", otpSendLimiter, adminController.sendOtp);
router.post("/otp/resend", otpSendLimiter, adminController.resendOtp);
router.post("/otp/verify", otpVerifyLimiter, adminController.verifyOtp);
router.post("/token/refresh", tokenRefreshLimiter, adminController.refreshToken);
router.post("/logout", generalAuthLimiter, adminController.logout);

module.exports = router;
