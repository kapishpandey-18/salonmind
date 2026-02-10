import { Router } from "express";
import { body } from "express-validator";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import { requireActiveSubscription } from "../../../middleware/subscriptionGuards.js";
import validate from "../../../middleware/validate.js";
import productsController from "../controllers/products.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", productsController.list);
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("price").optional().isNumeric(),
  body("brand").optional().isString(),
  body("category").optional().isString(),
  validate,
  productsController.create
);
router.patch(
  "/:id",
  body("name").optional().isString(),
  body("price").optional().isNumeric(),
  body("brand").optional().isString(),
  body("category").optional().isString(),
  validate,
  productsController.update
);
router.delete("/:id", productsController.remove);

export default router;
