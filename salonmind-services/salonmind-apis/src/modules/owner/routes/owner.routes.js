const router = require("express").Router();

const { authenticate, restrictToScope } = require("../../../middleware/auth");
const ownerController = require("../controllers/owner.controller");

router.use(authenticate, restrictToScope("SALON_OWNER"));

router.get("/me/context", ownerController.context);

module.exports = router;
