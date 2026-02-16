import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import {
  requireActiveSubscription,
  enforcePlanLimits,
} from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import staffController from "../controllers/staff.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", staffController.list);
router.get("/:id", staffController.detail);
router.post(
  "/",
  enforcePlanLimits("staff"),
  body("name").isString().notEmpty(),
  body("role").optional().isString(),
  body("email").optional().isEmail(),
  body("phone").optional().isString(),
  validate,
  staffController.create
);
router.patch(
  "/:id",
  body("name").optional().isString(),
  body("role").optional().isString(),
  body("email").optional().isEmail(),
  validate,
  staffController.update
);
router.patch(
  "/:id/status",
  body("isActive").isBoolean(),
  validate,
  staffController.status
);
router.delete("/:id", staffController.remove);

export default router;
