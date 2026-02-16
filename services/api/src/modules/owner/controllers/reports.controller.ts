import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { getTopServices } from "../services/reports.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const reportsController = {
  topServices: asyncHandler(async (req: Request, res: Response) => {
    const data = await getTopServices({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      range: req.query.range as string | undefined,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Top services fetched"));
  }),
};

export default reportsController;
