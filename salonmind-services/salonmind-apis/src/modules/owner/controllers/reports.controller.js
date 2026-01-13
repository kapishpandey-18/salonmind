const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const { getTopServices } = require("../services/reports.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const reportsController = {
  topServices: asyncHandler(async (req, res) => {
    const data = await getTopServices({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      range: req.query.range,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Top services fetched"));
  }),
};

module.exports = reportsController;
