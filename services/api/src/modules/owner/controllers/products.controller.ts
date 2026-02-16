import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/products.service.js";
import { extractBranchIdFromRequest } from "../utils/branchContext.js";

const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { results, pagination } = await listProducts({
      tenantId: req.user!.tenant!,
      branchId: extractBranchIdFromRequest(req),
      search: req.query.search as string | undefined,
      category: req.query.category as string | undefined,
      pagination: {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
    });
    const response = ApiResponse.paginated({ products: results }, pagination);
    return res.status(200).json(response);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await createProduct({
      tenantId: req.user!.tenant!,
      userId: req.user!.id,
      branchId: extractBranchIdFromRequest(req) || req.body.branchId,
      payload: req.body,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { product }, "Product created"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await updateProduct({
      tenantId: req.user!.tenant!,
      productId: req.params.id as string,
      payload: req.body,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { product }, "Product updated"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await deleteProduct({
      tenantId: req.user!.tenant!,
      productId: req.params.id as string,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Product deleted"));
  }),
};

export default productsController;
