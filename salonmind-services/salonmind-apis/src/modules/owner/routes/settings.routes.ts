import { Router } from "express";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import settingsController from "../controllers/settings.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", settingsController.detail);
router.patch("/", settingsController.update);

export default router;
