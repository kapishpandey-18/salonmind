const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const { requireActiveSubscription } = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const inventoryController = require("../controllers/inventory.controller");

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

module.exports = router;
