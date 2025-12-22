const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const { getTenantContext } = require("../services/tenant.service");

const ownerController = {
  context: asyncHandler(async (req, res) => {
    const requestedBranchId = req.headers["x-branch-id"] || null;
    const context = await getTenantContext({
      user: req.user,
      requestedBranchId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, context, "Tenant context fetched"));
  }),
};

module.exports = ownerController;
