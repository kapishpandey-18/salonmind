import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  updateStaffStatus,
} from "../services/staff.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const staffController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listStaff({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search as string | undefined,
      pagination: {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
    });
    const response = ApiResponse.paginated(
      { staff: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const staff = await createStaff({
      tenantId: req.user!.tenant!,
      userId: req.user!.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { staff }, "Staff member created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const staff = await updateStaff({
      tenantId: req.user!.tenant!,
      staffId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff member updated"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await deleteStaff({
      tenantId: req.user!.tenant!,
      staffId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Staff member removed"));
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const staff = await getStaff({
      tenantId: req.user!.tenant!,
      staffId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff member fetched"));
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.body as { isActive: boolean };
    const staff = await updateStaffStatus({
      tenantId: req.user!.tenant!,
      staffId: req.params.id as string,
      isActive,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { staff }, "Staff status updated"));
  }),
};

export default staffController;
