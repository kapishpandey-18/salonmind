const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const ApiError = require("../../../utils/ApiError");
const Branch = require("../../../models/Branch");
const Tenant = require("../../../models/Tenant");
const {
  listBranches,
  createBranch,
  updateBranch,
  setDefaultBranch,
  setActiveBranchForUser,
} = require("../services/branch.service");

const branchesController = {
  list: asyncHandler(async (req, res) => {
    const branches = await listBranches({ tenantId: req.user.tenant });
    return res
      .status(200)
      .json(new ApiResponse(200, { branches }, "Branches fetched"));
  }),

  create: asyncHandler(async (req, res) => {
    if (!req.body.name) {
      throw ApiError.badRequest("Branch name is required");
    }
    const branch = await createBranch({
      tenantId: req.user.tenant,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { branch }, "Branch created"));
  }),

  update: asyncHandler(async (req, res) => {
    const branch = await updateBranch({
      tenantId: req.user.tenant,
      branchId: req.params.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Branch updated"));
  }),

  setDefault: asyncHandler(async (req, res) => {
    const branch = await setDefaultBranch({
      tenantId: req.user.tenant,
      branchId: req.params.id,
    });
    await Tenant.findByIdAndUpdate(req.user.tenant, {
      defaultBranch: branch._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Default branch updated"));
  }),

  setActiveBranch: asyncHandler(async (req, res) => {
    const branch = await setActiveBranchForUser({
      tenantId: req.user.tenant,
      userId: req.user.id,
      branchId: req.body.branchId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Active branch updated"));
  }),
};

module.exports = branchesController;
