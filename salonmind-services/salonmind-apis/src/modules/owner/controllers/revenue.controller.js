const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const { getRevenueSummary } = require("../services/revenue.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const revenueController = {
  summary: asyncHandler(async (req, res) => {
    const data = await getRevenueSummary({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      range: req.query.range,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Revenue summary fetched"));
  }),
};

module.exports = revenueController;
