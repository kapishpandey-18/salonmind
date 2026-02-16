import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: (err as { path?: string; param?: string }).path ||
        (err as { path?: string; param?: string }).param,
      message: err.msg as string,
    }));

    throw ApiError.badRequest("Validation failed", errorMessages);
  }

  next();
};

export default validate;
