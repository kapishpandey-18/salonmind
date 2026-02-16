import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  getSettings,
  updateSettings,
} from "../services/settings.service.js";

const settingsController = {
  detail: asyncHandler(async (req: Request, res: Response) => {
    const data = await getSettings({ userId: req.user!.id });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Settings fetched"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await updateSettings({
      userId: req.user!.id,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Settings updated"));
  }),
};

export default settingsController;
