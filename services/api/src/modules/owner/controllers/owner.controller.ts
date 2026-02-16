import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { getTenantContext } from "../services/tenant.service.js";

const ownerController = {
  context: asyncHandler(async (req: Request, res: Response) => {
    const requestedBranchId = req.headers["x-branch-id"] as string | undefined;
    const context = await getTenantContext({
      user: req.user!,
      requestedBranchId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, context, "Tenant context fetched"));
  }),
};

export default ownerController;
