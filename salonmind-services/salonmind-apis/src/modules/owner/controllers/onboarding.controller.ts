import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  saveProfile,
  saveBusinessHoursStep,
  saveServicesStep,
  saveStaffStep,
  initiateCheckout,
  confirmPayment,
} from "../services/onboarding.service.js";

const onboardingController = {
  saveProfile: asyncHandler(async (req: Request, res: Response) => {
    await saveProfile({ userId: req.user!.id, payload: req.body });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Profile saved"));
  }),

  saveBusinessHours: asyncHandler(async (req: Request, res: Response) => {
    const { businessHours } = req.body as { businessHours: Array<{ day: string; isOpen: boolean; openTime: string; closeTime: string }> };
    await saveBusinessHoursStep({
      userId: req.user!.id,
      businessHours,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Business hours saved"));
  }),

  saveServices: asyncHandler(async (req: Request, res: Response) => {
    const { services } = req.body as { services: Array<{ name: string; duration?: string; price?: number; category?: string }> };
    await saveServicesStep({
      userId: req.user!.id,
      services,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Services saved"));
  }),

  saveStaff: asyncHandler(async (req: Request, res: Response) => {
    const { staff } = req.body as { staff: Array<{ name: string; role?: string; email?: string; phone?: string }> };
    await saveStaffStep({
      userId: req.user!.id,
      staff,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Staff saved"));
  }),

  checkout: asyncHandler(async (req: Request, res: Response) => {
    const { planCode } = req.body as { planCode: string };
    const data = await initiateCheckout({
      userId: req.user!.id,
      planCode,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Checkout initiated"));
  }),

  confirm: asyncHandler(async (req: Request, res: Response) => {
    const { orderId, paymentId, signature } = req.body as {
      orderId: string;
      paymentId: string;
      signature: string;
    };
    const data = await confirmPayment({
      userId: req.user!.id,
      orderId,
      paymentId,
      signature,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Onboarding completed"));
  }),
};

export default onboardingController;
