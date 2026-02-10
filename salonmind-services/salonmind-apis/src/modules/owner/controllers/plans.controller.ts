import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { listPlans } from "../services/subscription.service.js";

const plansController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const plans = await listPlans();
    return res
      .status(200)
      .json(new ApiResponse(200, { plans }, "Plans fetched"));
  }),
};

export default plansController;
