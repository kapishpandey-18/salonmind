import type { Request, Response } from "express";
import type { TenantAppointmentStatus } from "../../../types/index.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointment,
  deleteAppointment,
} from "../services/appointments.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const appointmentsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listAppointments({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as TenantAppointmentStatus | undefined,
      pagination: {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
    });
    const response = ApiResponse.paginated(
      { appointments: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await createAppointment({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      userId: req.user!.id,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { appointment }, "Appointment created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await updateAppointment({
      tenantId: req.user!.tenant!,
      appointmentId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment updated"));
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body as { reason?: string };
    const appointment = await cancelAppointment({
      tenantId: req.user!.tenant!,
      appointmentId: req.params.id as string,
      reason,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment cancelled"));
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await getAppointment({
      tenantId: req.user!.tenant!,
      appointmentId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { appointment }, "Appointment fetched"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await deleteAppointment({
      tenantId: req.user!.tenant!,
      appointmentId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Appointment removed"));
  }),
};

export default appointmentsController;
