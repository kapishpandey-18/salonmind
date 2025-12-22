const router = require("express").Router();

const { body } = require("express-validator");
const { authenticate, restrictToScope } = require("../../../middleware/auth");
const {
  requireActiveSubscription,
} = require("../../../middleware/subscriptionGuards");
const validate = require("../../../middleware/validate");
const clientsController = require("../controllers/clients.controller");

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

module.exports = router;
