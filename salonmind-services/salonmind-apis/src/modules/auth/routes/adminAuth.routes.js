const router = require("express").Router();
const adminController = require("../controllers/adminAuth.controller");

router.post("/otp/send", adminController.sendOtp);
router.post("/otp/resend", adminController.resendOtp);
router.post("/otp/verify", adminController.verifyOtp);
router.post("/token/refresh", adminController.refreshToken);
router.post("/logout", adminController.logout);

module.exports = router;
