import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { getRevenueSummary } from "../services/revenue.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const revenueController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const data = await getRevenueSummary({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Revenue summary fetched"));
  }),
};

export default revenueController;
