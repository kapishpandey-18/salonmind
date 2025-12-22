const router = require("express").Router();
const controller = require("../controllers/salonOwnerAuth.controller");
const {
  authenticate,
  restrictToScope,
} = require("../../../middleware/auth");

router.post("/otp/send", controller.sendOtp);
router.post("/otp/resend", controller.resendOtp);
router.post("/otp/verify", controller.verifyOtp);
router.post("/token/refresh", controller.refreshToken);
router.post("/logout", controller.logout);

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
