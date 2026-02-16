import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import Tenant from "../../../models/Tenant.js";
import {
  listBranches,
  createBranch,
  updateBranch,
  setDefaultBranch,
  setActiveBranchForUser,
} from "../services/branch.service.js";

const branchesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const branches = await listBranches({ tenantId: req.user!.tenant! });
    return res
      .status(200)
      .json(new ApiResponse(200, { branches }, "Branches fetched"));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.name) {
      throw ApiError.badRequest("Branch name is required");
    }
    const branch = await createBranch({
      tenantId: req.user!.tenant!,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { branch }, "Branch created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const branch = await updateBranch({
      tenantId: req.user!.tenant!,
      branchId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Branch updated"));
  }),

  setDefault: asyncHandler(async (req: Request, res: Response) => {
    const branch = await setDefaultBranch({
      tenantId: req.user!.tenant!,
      branchId: req.params.id as string,
    });
    await Tenant.findByIdAndUpdate(req.user!.tenant, {
      defaultBranch: branch._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Default branch updated"));
  }),

  setActiveBranch: asyncHandler(async (req: Request, res: Response) => {
    const { branchId } = req.body as { branchId: string };
    const branch = await setActiveBranchForUser({
      tenantId: req.user!.tenant!,
      userId: req.user!.id,
      branchId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { branch }, "Active branch updated"));
  }),
};

export default branchesController;
