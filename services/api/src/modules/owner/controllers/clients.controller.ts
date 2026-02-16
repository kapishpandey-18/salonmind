import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listClients,
  createClient,
  updateClient,
  getClientHistory,
  getClient,
  deleteClient,
} from "../services/clients.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const clientsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listClients({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search as string | undefined,
      pagination: {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
    });
    const response = ApiResponse.paginated(
      { clients: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const client = await createClient({
      tenantId: req.user!.tenant!,
      userId: req.user!.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { client }, "Client created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const client = await updateClient({
      tenantId: req.user!.tenant!,
      clientId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { client }, "Client updated"));
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const client = await getClient({
      tenantId: req.user!.tenant!,
      clientId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { client }, "Client fetched"));
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const history = await getClientHistory({
      tenantId: req.user!.tenant!,
      clientId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { history }, "Client history fetched"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await deleteClient({
      tenantId: req.user!.tenant!,
      clientId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Client deleted"));
  }),
};

export default clientsController;
