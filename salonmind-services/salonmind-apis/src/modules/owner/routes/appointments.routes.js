const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const {
  requireActiveSubscription,
} = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const appointmentsController = require("../controllers/appointments.controller");

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

module.exports = router;
