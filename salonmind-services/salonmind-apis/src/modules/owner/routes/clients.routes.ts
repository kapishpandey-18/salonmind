import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import clientsController from "../controllers/clients.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", clientsController.list);
router.get("/:id", clientsController.detail);
router.post(
  "/",
  body("fullName").isString().notEmpty(),
  body("phoneNumber").isString().notEmpty(),
  body("email").optional().isEmail(),
  validate,
  clientsController.create
);
router.patch(
  "/:id",
  body("fullName").optional().isString(),
  body("phoneNumber").optional().isString(),
  body("email").optional().isEmail(),
  validate,
  clientsController.update
);
router.get("/:id/history", clientsController.history);
router.delete("/:id", clientsController.remove);

export default router;
