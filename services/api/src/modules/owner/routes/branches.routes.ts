import { Router } from "express";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import {
  requireActiveSubscription,
  enforcePlanLimits,
} from "../../../middleware/subscriptionGuards.js";
import branchesController from "../controllers/branches.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", branchesController.list);
router.post("/", enforcePlanLimits("branch"), branchesController.create);
router.post("/active", branchesController.setActiveBranch);
router.patch("/:id", branchesController.update);
router.post("/:id/set-default", branchesController.setDefault);

export default router;
