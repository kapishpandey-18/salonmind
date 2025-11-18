const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  sendOTP,
  verifyOTP,
  updateProfile,
  completeOnboarding,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Protected routes
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);
router.patch("/update-profile", authenticate, updateProfile);
router.post("/complete-onboarding", authenticate, completeOnboarding);

module.exports = router;
