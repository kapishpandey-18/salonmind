const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listInventory,
  updateInventory,
} = require("../services/inventory.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const inventoryController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listInventory({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search,
      category: req.query.category,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated({ inventory: results }, pagination);
    return res.status(200).json(response);
  }),

  update: asyncHandler(async (req, res) => {
    const item = await updateInventory({
      tenantId: req.user.tenant,
      productId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { inventory: item }, "Inventory updated"));
  }),
};

module.exports = inventoryController;
