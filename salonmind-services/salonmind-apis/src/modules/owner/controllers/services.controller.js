const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listServices,
  createService,
  updateService,
  deleteService,
  getService,
  updateServiceStatus,
} = require("../services/services.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const servicesController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listServices({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated(
      { services: results },
      pagination
    );
    return res.status(200).json(response);
  }),
  create: asyncHandler(async (req, res) => {
    const service = await createService({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      userId: req.user.id,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { service }, "Service created"));
  }),
  update: asyncHandler(async (req, res) => {
    const service = await updateService({
      tenantId: req.user.tenant,
      serviceId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service updated"));
  }),
  remove: asyncHandler(async (req, res) => {
    await deleteService({
      tenantId: req.user.tenant,
      serviceId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Service removed"));
  }),

  detail: asyncHandler(async (req, res) => {
    const service = await getService({
      tenantId: req.user.tenant,
      serviceId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service fetched"));
  }),

  status: asyncHandler(async (req, res) => {
    const service = await updateServiceStatus({
      tenantId: req.user.tenant,
      serviceId: req.params.id,
      isActive: req.body.isActive,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service status updated"));
  }),
};

module.exports = servicesController;
