const router = require("express").Router();
const controller = require("../controllers/salonEmployeeAuth.controller");
const {
  otpSendLimiter,
  otpVerifyLimiter,
  tokenRefreshLimiter,
  generalAuthLimiter,
} = require("../../../middleware/rateLimiter");

router.post("/otp/send", otpSendLimiter, controller.sendOtp);
router.post("/otp/resend", otpSendLimiter, controller.resendOtp);
router.post("/otp/verify", otpVerifyLimiter, controller.verifyOtp);
router.post("/token/refresh", tokenRefreshLimiter, controller.refreshToken);
router.post("/logout", generalAuthLimiter, controller.logout);

module.exports = router;
