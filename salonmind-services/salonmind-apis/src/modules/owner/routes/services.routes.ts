import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import servicesController from "../controllers/services.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", servicesController.list);
router.get("/:id", servicesController.detail);
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("duration").optional().isNumeric(),
  body("price").optional().isNumeric(),
  validate,
  servicesController.create
);
router.patch(
  "/:id",
  body("name").optional().isString(),
  body("duration").optional().isNumeric(),
  body("price").optional().isNumeric(),
  validate,
  servicesController.update
);
router.patch(
  "/:id/status",
  body("isActive").isBoolean(),
  validate,
  servicesController.status
);
router.delete("/:id", servicesController.remove);

export default router;
