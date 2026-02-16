import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import appointmentsController from "../controllers/appointments.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", appointmentsController.list);
router.get("/:id", appointmentsController.detail);
router.post(
  "/",
  body("clientId").isString().notEmpty(),
  body("staffId").isString().notEmpty(),
  body("serviceIds").optional().isArray({ min: 1 }),
  body("serviceId").optional().isString(),
  body("startAt").optional().isISO8601(),
  validate,
  appointmentsController.create
);
router.patch(
  "/:id",
  body("clientId").optional().isString(),
  body("staffId").optional().isString(),
  body("serviceIds").optional().isArray({ min: 1 }),
  body("serviceId").optional().isString(),
  body("startAt").optional().isISO8601(),
  validate,
  appointmentsController.update
);
router.delete("/:id", appointmentsController.remove);
router.post("/:id/cancel", appointmentsController.cancel);

export default router;
