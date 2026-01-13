const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/products.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const productsController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listProducts({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search,
      category: req.query.category,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated({ products: results }, pagination);
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req, res) => {
    const product = await createProduct({
      tenantId: req.user.tenant,
      userId: req.user.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { product }, "Product created"));
  }),

  update: asyncHandler(async (req, res) => {
    const product = await updateProduct({
      tenantId: req.user.tenant,
      productId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { product }, "Product updated"));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteProduct({
      tenantId: req.user.tenant,
      productId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Product deleted"));
  }),
};

module.exports = productsController;
