const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const { requireActiveSubscription } = require("../../../middleware/subscriptionGuards");
const settingsController = require("../controllers/settings.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", settingsController.detail);
router.patch("/", settingsController.update);

module.exports = router;
