import { Router } from "express";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { enforcePlanLimits } from "../../../middleware/subscriptionGuards.js";
import onboardingController from "../controllers/onboarding.controller.js";

const router = Router();

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

export default router;
