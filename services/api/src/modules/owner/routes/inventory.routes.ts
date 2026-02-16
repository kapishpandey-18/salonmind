import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import inventoryController from "../controllers/inventory.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", inventoryController.list);
router.patch(
  "/:id",
  body("currentStock").optional().isNumeric(),
  body("minStock").optional().isNumeric(),
  body("maxStock").optional().isNumeric(),
  body("price").optional().isNumeric(),
  validate,
  inventoryController.update
);

export default router;
