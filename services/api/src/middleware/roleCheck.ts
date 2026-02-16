import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";

const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

export const requireOwner = requireRole("owner");
export const requireOwnerOrManager = requireRole("owner", "manager");
export const requireStaff = requireRole("owner", "manager", "staff");

export { requireRole };
