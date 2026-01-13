const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const { listPlans } = require("../services/subscription.service");

const plansController = {
  list: asyncHandler(async (_req, res) => {
    const plans = await listPlans();
    return res
      .status(200)
      .json(new ApiResponse(200, { plans }, "Plans fetched"));
  }),
};

module.exports = plansController;
