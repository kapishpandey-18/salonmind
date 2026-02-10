import { Router } from "express";
import adminController from "../controllers/adminAuth.controller.js";
import {
  otpSendLimiter,
  otpVerifyLimiter,
  tokenRefreshLimiter,
  generalAuthLimiter,
} from "../../../middleware/rateLimiter.js";

const router = Router();

router.post("/otp/send", otpSendLimiter, adminController.sendOtp);
router.post("/otp/resend", otpSendLimiter, adminController.resendOtp);
router.post("/otp/verify", otpVerifyLimiter, adminController.verifyOtp);
router.post(
  "/token/refresh",
  tokenRefreshLimiter,
  adminController.refreshToken
);
router.post("/logout", generalAuthLimiter, adminController.logout);

export default router;
