const router = require("express").Router();
const controller = require("../controllers/salonEmployeeAuth.controller");

router.post("/otp/send", controller.sendOtp);
router.post("/otp/resend", controller.resendOtp);
router.post("/otp/verify", controller.verifyOtp);
router.post("/token/refresh", controller.refreshToken);
router.post("/logout", controller.logout);

module.exports = router;
