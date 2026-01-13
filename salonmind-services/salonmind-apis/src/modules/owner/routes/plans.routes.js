const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const plansController = require("../controllers/plans.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"));

router.get("/", plansController.list);

module.exports = router;
