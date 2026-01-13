const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const { requireActiveSubscription } = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const productsController = require("../controllers/products.controller");

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

module.exports = router;
