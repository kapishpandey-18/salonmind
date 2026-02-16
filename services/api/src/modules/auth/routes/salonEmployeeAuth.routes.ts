import { Router } from "express";
import controller from "../controllers/salonEmployeeAuth.controller.js";
import {
  otpSendLimiter,
  otpVerifyLimiter,
  tokenRefreshLimiter,
  generalAuthLimiter,
} from "../../../middleware/rateLimiter.js";

const router = Router();

router.post("/otp/send", otpSendLimiter, controller.sendOtp);
router.post("/otp/resend", otpSendLimiter, controller.resendOtp);
router.post("/otp/verify", otpVerifyLimiter, controller.verifyOtp);
router.post(
  "/token/refresh",
  tokenRefreshLimiter,
  controller.refreshToken
);
router.post("/logout", generalAuthLimiter, controller.logout);

export default router;
