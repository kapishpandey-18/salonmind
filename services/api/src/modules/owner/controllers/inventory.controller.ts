import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listInventory,
  updateInventory,
} from "../services/inventory.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const inventoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listInventory({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search as string | undefined,
      category: req.query.category as string | undefined,
      pagination: { page: req.query.page as string | undefined, limit: req.query.limit as string | undefined },
    });
    const response = ApiResponse.paginated(
      { inventory: results },
      pagination
    );
    return res.status(200).json(response);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await updateInventory({
      tenantId: req.user!.tenant!,
      productId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { inventory: item }, "Inventory updated"));
  }),
};

export default inventoryController;
