const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const { requireActiveSubscription } = require("../../../middleware/subscriptionGuards");
const revenueController = require("../controllers/revenue.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/summary", revenueController.summary);

module.exports = router;
