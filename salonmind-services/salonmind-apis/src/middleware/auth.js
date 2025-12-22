const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const Session = require("../modules/auth/models/Session.model");
const tokenService = require("../modules/auth/services/token.service");

const authenticate = asyncHandler(async (req, _res, next) => {
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

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = tokenService.verifyAccessToken(token);
      if (!mongoose.Types.ObjectId.isValid(payload.sessionId)) {
        throw new Error("Invalid session");
      }
      const session = await Session.findById(payload.sessionId);
      if (!session || !session.isActive || session.user.toString() !== payload.sub) {
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
    } catch (error) {
      // swallow error for optional auth
    }
  }
  next();
});

const restrictTo = (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden("You are not authorized to perform this action");
    }
    next();
  };

const restrictToScope = (...surfaces) =>
  (req, _res, next) => {
    if (!req.auth || !surfaces.includes(req.auth.surface)) {
      throw ApiError.forbidden("Surface not authorized for this resource");
    }
    next();
  };

module.exports = {
  authenticate,
  optionalAuth,
  restrictTo,
  restrictToScope,
  authorize: restrictTo,
  protect: authenticate,
};
