const router = require("express").Router();
const controller = require("../controllers/salonOwnerAuth.controller");
const {
  authenticate,
  restrictToScope,
} = require("../../../middleware/auth");
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

router.get(
  "/me",
  authenticate,
  restrictToScope("SALON_OWNER"),
  controller.getProfile
);

router.patch(
  "/update-profile",
  authenticate,
  restrictToScope("SALON_OWNER"),
  controller.updateProfile
);

module.exports = router;
