import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import buildController from "./baseAuth.controller.js";
import {
  SURFACES,
  getAuthenticatedProfile,
  updateProfile,
} from "../services/auth.service.js";

const controller = buildController(SURFACES.SALON_OWNER);

controller.getProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAuthenticatedProfile(req.user!._id);
  return res
    .status(200)
    .json(new ApiResponse(200, { user: data }, "Profile fetched"));
});

controller.updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await updateProfile({
      userId: req.user!._id,
      data: req.body as {
        firstName?: string;
        lastName?: string;
        email?: string;
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Profile updated successfully"));
  }
);

export default controller;
