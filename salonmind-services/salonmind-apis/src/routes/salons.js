const express = require("express");
const router = express.Router();
const {
  createSalon,
  getSalons,
  getSalonById,
  updateSalon,
  deleteSalon,
} = require("../controllers/salonsController");
const { authenticate } = require("../middleware/auth");
const { requireOwnerOrManager } = require("../middleware/roleCheck");

// All salon routes require authentication
router.use(authenticate);

// Apply role-based access control
router.route("/").get(getSalons).post(requireOwnerOrManager, createSalon);

router
  .route("/:id")
  .get(getSalonById)
  .put(requireOwnerOrManager, updateSalon)
  .delete(requireOwnerOrManager, deleteSalon);

module.exports = router;
