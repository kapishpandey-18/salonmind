import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import Session from "../modules/auth/models/Session.model.js";
import * as tokenService from "../modules/auth/services/token.service.js";
import type { Surface } from "../types/index.js";

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Access token required");
  }

  const token = authHeader.split(" ")[1];
  const payload = tokenService.verifyAccessToken(token);

  if (!mongoose.Types.ObjectId.isValid(payload.sessionId)) {
    throw ApiError.unauthorized("Session not found");
  }

  const session = await Session.findById(payload.sessionId);
  if (!session || !session.isActive) {
    throw ApiError.unauthorized("Session is invalid");
  }

  if (session.user.toString() !== payload.sub) {
    throw ApiError.unauthorized("Session user mismatch");
  }

  const user = await User.findById(payload.sub).select("-password");
  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  req.user = user;
  req.auth = {
    surface: payload.surface,
    sessionId: payload.sessionId,
  };
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = tokenService.verifyAccessToken(token);
      if (!mongoose.Types.ObjectId.isValid(payload.sessionId)) {
        throw new Error("Invalid session");
      }
      const session = await Session.findById(payload.sessionId);
      if (
        !session ||
        !session.isActive ||
        session.user.toString() !== payload.sub
      ) {
        throw new Error("Invalid session");
      }
      const user = await User.findById(payload.sub).select("-password");
      if (!user) {
        throw new Error("User not found");
      }
      req.user = user;
      req.auth = {
        surface: payload.surface,
        sessionId: payload.sessionId,
      };
    } catch {
      // swallow error for optional auth
    }
  }
  next();
});

export const restrictTo = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You are not authorized to perform this action"
      );
    }
    next();
  };

export const restrictToScope = (...surfaces: Surface[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !surfaces.includes(req.auth.surface)) {
      throw ApiError.forbidden(
        "Surface not authorized for this resource"
      );
    }
    next();
  };

export const authorize = restrictTo;
export const protect = authenticate;
