const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const branchesController = require("../controllers/branches.controller");
const {
  requireActiveSubscription,
  enforcePlanLimits,
} = require("../../../middleware/subscriptionGuards");

router.use(authenticate, restrictToScope("SALON_OWNER"), requireActiveSubscription);

router.get("/", branchesController.list);
router.post("/", enforcePlanLimits("branch"), branchesController.create);
router.post("/active", branchesController.setActiveBranch);
router.patch("/:id", branchesController.update);
router.post("/:id/set-default", branchesController.setDefault);

module.exports = router;
