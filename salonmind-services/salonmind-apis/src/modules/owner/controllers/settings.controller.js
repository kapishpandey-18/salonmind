const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  getSettings,
  updateSettings,
} = require("../services/settings.service");

const settingsController = {
  detail: asyncHandler(async (req, res) => {
    const data = await getSettings({ userId: req.user.id });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Settings fetched"));
  }),

  update: asyncHandler(async (req, res) => {
    const data = await updateSettings({
      userId: req.user.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Settings updated"));
  }),
};

module.exports = settingsController;
