const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const buildController = require("./baseAuth.controller");
const {
  SURFACES,
  getAuthenticatedProfile,
  updateProfile,
} = require("../services/auth.service");

const controller = buildController(SURFACES.SALON_OWNER);

controller.getProfile = asyncHandler(async (req, res) => {
  const data = await getAuthenticatedProfile(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { user: data }, "Profile fetched"));
});

controller.updateProfile = asyncHandler(async (req, res) => {
  const data = await updateProfile({ userId: req.user.id, data: req.body });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Profile updated successfully"));
});

module.exports = controller;
