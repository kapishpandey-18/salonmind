const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const onboardingController = require("../controllers/onboarding.controller");
const { enforcePlanLimits } = require("../../../middleware/subscriptionGuards");

router.use(authenticate, restrictToScope("SALON_OWNER"));

router.put("/profile", onboardingController.saveProfile);
router.put("/business-hours", onboardingController.saveBusinessHours);
router.put("/services", onboardingController.saveServices);
router.put(
  "/staff",
  enforcePlanLimits("staff"),
  onboardingController.saveStaff
);
router.post("/checkout", onboardingController.checkout);
router.post("/confirm", onboardingController.confirm);

module.exports = router;
