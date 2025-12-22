const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const {
  requireActiveSubscription,
} = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const servicesController = require("../controllers/services.controller");

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

module.exports = router;
