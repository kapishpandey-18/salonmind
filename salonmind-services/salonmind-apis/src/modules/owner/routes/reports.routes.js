const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const { requireActiveSubscription } = require("../../../middleware/subscriptionGuards");
const reportsController = require("../controllers/reports.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/top-services", reportsController.topServices);

module.exports = router;
