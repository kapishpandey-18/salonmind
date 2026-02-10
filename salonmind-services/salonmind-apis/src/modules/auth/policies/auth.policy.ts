import ApiError from "../../../utils/ApiError.js";
import env from "../../../config/env.js";
import type { IUser } from "../../../models/User.js";
import type { Document, Types } from "mongoose";

const isPhoneAllowListed = (phone: string): boolean =>
  env.adminAllowlist.some((allowed) => allowed === phone);

export function ensureAdminPhoneAllowed(phone: string): void {
  if (!isPhoneAllowListed(phone)) {
    throw ApiError.forbidden(
      "Phone number is not authorized for admin access"
    );
  }
}

export function ensureEmployeeActive(
  user: (Document<Types.ObjectId, object, IUser> & IUser) | null
): void {
  if (!user) {
    throw ApiError.notFound("Employee record not found");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("Employee account is inactive");
  }
  if (!user.tenant) {
    throw ApiError.badRequest("Employee is not assigned to a tenant");
  }
}
