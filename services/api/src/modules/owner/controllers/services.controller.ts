import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listServices,
  createService,
  updateService,
  deleteService,
  getService,
  updateServiceStatus,
} from "../services/services.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const servicesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listServices({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search as string | undefined,
      pagination: {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
    });
    const response = ApiResponse.paginated(
      { services: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const service = await createService({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      userId: req.user!.id,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { service }, "Service created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const service = await updateService({
      tenantId: req.user!.tenant!,
      serviceId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service updated"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await deleteService({
      tenantId: req.user!.tenant!,
      serviceId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Service removed"));
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const service = await getService({
      tenantId: req.user!.tenant!,
      serviceId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service fetched"));
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.body as { isActive: boolean };
    const service = await updateServiceStatus({
      tenantId: req.user!.tenant!,
      serviceId: req.params.id as string,
      isActive,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { service }, "Service status updated"));
  }),
};

export default servicesController;
