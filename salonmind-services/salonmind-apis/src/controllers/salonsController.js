const Salon = require("../models/Salon");
const User = require("../models/User");
const logger = require("../utils/logger");

// @desc    Create new salon
// @route   POST /api/salons
// @access  Private
exports.createSalon = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      email,
      businessHours,
      settings,
    } = req.body;

    logger.info("Creating salon:", { name, owner: req.user.id });

    // Create salon with the authenticated user as owner
    const salon = await Salon.create({
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      email,
      owner: req.user.id,
      businessHours,
      settings,
    });

    // Update user's salon reference
    await User.findByIdAndUpdate(req.user.id, {
      salon: salon._id,
      role: "owner",
    });

    logger.success("Salon created:", { salonId: salon._id, name });

    res.status(201).json({
      success: true,
      data: salon,
      message: "Salon created successfully",
    });
  } catch (error) {
    logger.error("Create salon error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating salon",
      error: error.message,
    });
  }
};

// @desc    Get all salons (for current user)
// @route   GET /api/salons
// @access  Private
exports.getSalons = async (req, res) => {
  try {
    // Get salons where user is owner or staff
    const salons = await Salon.find({
      $or: [{ owner: req.user.id }, { "staff.userId": req.user.id }],
    }).populate("owner", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: salons.length,
      data: salons,
    });
  } catch (error) {
    logger.error("Get salons error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching salons",
      error: error.message,
    });
  }
};

// @desc    Get single salon
// @route   GET /api/salons/:id
// @access  Private
exports.getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate("owner", "firstName lastName email avatar")
      .populate("staff.userId", "firstName lastName email avatar");

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // Check if user has access to this salon
    const hasAccess =
      salon.owner._id.toString() === req.user.id ||
      salon.staff.some((s) => s.userId._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this salon",
      });
    }

    res.status(200).json({
      success: true,
      data: salon,
    });
  } catch (error) {
    logger.error("Get salon error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching salon",
      error: error.message,
    });
  }
};

// @desc    Update salon
// @route   PUT /api/salons/:id
// @access  Private (Owner only)
exports.updateSalon = async (req, res) => {
  try {
    let salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // Check if user is owner
    if (salon.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this salon",
      });
    }

    salon = await Salon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.success("Salon updated:", { salonId: salon._id });

    res.status(200).json({
      success: true,
      data: salon,
      message: "Salon updated successfully",
    });
  } catch (error) {
    logger.error("Update salon error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating salon",
      error: error.message,
    });
  }
};

// @desc    Delete salon
// @route   DELETE /api/salons/:id
// @access  Private (Owner only)
exports.deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // Check if user is owner
    if (salon.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this salon",
      });
    }

    await salon.deleteOne();

    logger.success("Salon deleted:", { salonId: salon._id });

    res.status(200).json({
      success: true,
      message: "Salon deleted successfully",
    });
  } catch (error) {
    logger.error("Delete salon error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting salon",
      error: error.message,
    });
  }
};
