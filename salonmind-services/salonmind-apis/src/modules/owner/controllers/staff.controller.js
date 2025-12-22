const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  updateStaffStatus,
} = require("../services/staff.service");
const { extractBranchIdFromRequest } = require("../utils/branchContext");

const staffController = {
  list: asyncHandler(async (req, res) => {
    const { results, pagination } = await listStaff({
      tenantId: req.user.tenant,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search,
      pagination: { page: req.query.page, limit: req.query.limit },
    });
    const response = ApiResponse.paginated(
      { staff: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req, res) => {
    const staff = await createStaff({
      tenantId: req.user.tenant,
      userId: req.user.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { staff }, "Staff member created"));
  }),

  update: asyncHandler(async (req, res) => {
    const staff = await updateStaff({
      tenantId: req.user.tenant,
      staffId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff member updated"));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteStaff({
      tenantId: req.user.tenant,
      staffId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Staff member removed"));
  }),

  detail: asyncHandler(async (req, res) => {
    const staff = await getStaff({
      tenantId: req.user.tenant,
      staffId: req.params.id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff member fetched"));
  }),

  status: asyncHandler(async (req, res) => {
    const staff = await updateStaffStatus({
      tenantId: req.user.tenant,
      staffId: req.params.id,
      isActive: req.body.isActive,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff status updated"));
  }),
};

module.exports = staffController;
