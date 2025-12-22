const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const {
  requireActiveSubscription,
} = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const staffController = require("../controllers/staff.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", staffController.list);
router.get("/:id", staffController.detail);
router.post(
  "/",
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

module.exports = router;
