import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import User from "../../../models/User.js";
import type { IUserDocument } from "../../../models/User.js";
import * as otpService from "./otp.service.js";
import * as tokenService from "./token.service.js";
import {
  ensureAdminPhoneAllowed,
  ensureEmployeeActive,
} from "../policies/auth.policy.js";
import { ensureTenantForOwner } from "../../owner/services/tenant.service.js";
import type {
  Surface,
  SanitizedUser,
  AuthTokenResult,
  OtpChallengeResult,
} from "../../../types/index.js";

export const SURFACES = {
  ADMIN: "ADMIN" as Surface,
  SALON_OWNER: "SALON_OWNER" as Surface,
  SALON_EMPLOYEE: "SALON_EMPLOYEE" as Surface,
} as const;

const sanitizeUser = (user: IUserDocument): SanitizedUser => ({
  id: user._id as Types.ObjectId,
  phoneNumber: user.phoneNumber,
  role: user.role,
  tenant: user.tenant,
  activeBranch: user.activeBranch,
  isActive: user.isActive,
  isOnboarded: user.isOnboarded,
  isProfileComplete: user.isProfileComplete,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});

async function handleAdminSurface(
  phoneNumber: string
): Promise<IUserDocument> {
  ensureAdminPhoneAllowed(phoneNumber);
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    throw ApiError.notFound("Admin account not found");
  }
  if (user.role !== SURFACES.ADMIN) {
    throw ApiError.forbidden(
      "Account is not authorized for admin surface"
    );
  }
  return user as IUserDocument;
}

async function handleSalonOwnerSurface(
  phoneNumber: string
): Promise<IUserDocument> {
  let user = (await User.findOne({ phoneNumber })) as IUserDocument | null;
  if (!user) {
    user = (await User.create({
      phoneNumber,
      role: SURFACES.SALON_OWNER,
      isProfileComplete: false,
      isOnboarded: false,
    })) as IUserDocument;
  }

  await ensureTenantForOwner(user);
  user.role = SURFACES.SALON_OWNER;
  await user.save();
  return user;
}

async function handleSalonEmployeeSurface(
  phoneNumber: string
): Promise<IUserDocument> {
  const user = (await User.findOne({ phoneNumber }).populate(
    "tenant"
  )) as IUserDocument | null;
  ensureEmployeeActive(user);
  if (
    user!.role !== "staff" &&
    user!.role !== SURFACES.SALON_EMPLOYEE
  ) {
    throw ApiError.forbidden(
      "Account is not authorized for employee surface"
    );
  }
  return user!;
}

async function issueSessionTokens({
  user,
  surface,
  ip,
  userAgent,
}: {
  user: IUserDocument;
  surface: Surface;
  ip?: string;
  userAgent?: string;
}): Promise<AuthTokenResult> {
  user.lastLogin = new Date();
  await user.save();

  const session = await tokenService.createSession({
    userId: user._id as Types.ObjectId,
    surface,
    ip,
    userAgent,
  });

  const access = tokenService.generateAccessToken({
    userId: user._id as Types.ObjectId,
    surface,
    sessionId: session._id,
  });

  const refresh = await tokenService.generateRefreshToken({
    userId: user._id as Types.ObjectId,
    surface,
    sessionId: session._id as Types.ObjectId,
    ip,
  });

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    expiresIn: access.expiresIn,
    user: sanitizeUser(user),
  };
}

export async function initiateOtp({
  phone,
  surface,
  meta,
}: {
  phone: string;
  surface: Surface;
  meta: { ip?: string; userAgent?: string };
}): Promise<OtpChallengeResult> {
  if (surface === SURFACES.ADMIN) {
    ensureAdminPhoneAllowed(phone);
  }
  return otpService.createChallenge({ phone, surface, meta });
}

export async function resendOtp({
  challengeId,
  surface,
}: {
  challengeId: string;
  surface: Surface;
}): Promise<OtpChallengeResult> {
  return otpService.resendChallenge({ challengeId, surface });
}

export async function verifyOtp({
  challengeId,
  otp,
  surface,
  meta,
}: {
  challengeId: string;
  otp: string;
  surface: Surface;
  meta: { ip?: string; userAgent?: string };
}): Promise<AuthTokenResult> {
  const result = await otpService.verifyChallenge({ challengeId, otp });
  if (result.surface !== surface) {
    throw ApiError.badRequest("OTP challenge surface mismatch");
  }

  let user: IUserDocument;
  if (surface === SURFACES.ADMIN) {
    user = await handleAdminSurface(result.phone);
  } else if (surface === SURFACES.SALON_OWNER) {
    user = await handleSalonOwnerSurface(result.phone);
  } else if (surface === SURFACES.SALON_EMPLOYEE) {
    user = await handleSalonEmployeeSurface(result.phone);
  } else {
    throw ApiError.badRequest("Unsupported surface");
  }

  return issueSessionTokens({
    user,
    surface,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
}

export async function refreshTokens({
  refreshToken,
  surface,
  ip,
}: {
  refreshToken: string;
  surface: Surface;
  ip?: string;
}): Promise<AuthTokenResult> {
  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  const storedToken = await tokenService.verifyRefreshToken(refreshToken);

  if (storedToken.surface !== surface) {
    throw ApiError.forbidden("Refresh token scope mismatch");
  }

  const user = (await User.findById(
    storedToken.user
  )) as IUserDocument | null;
  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  const sessionDoc = storedToken.session as unknown as {
    isActive: boolean;
    user: Types.ObjectId;
    _id: Types.ObjectId;
  };
  if (!sessionDoc || !sessionDoc.isActive) {
    throw ApiError.unauthorized("Session is invalid");
  }
  if (sessionDoc.user.toString() !== user._id.toString()) {
    throw ApiError.unauthorized("Session user mismatch");
  }

  const { token: nextRefreshToken, session } =
    await tokenService.rotateRefreshToken(storedToken, {
      ip,
    });

  const access = tokenService.generateAccessToken({
    userId: user._id as Types.ObjectId,
    surface,
    sessionId: session._id,
  });

  return {
    accessToken: access.token,
    refreshToken: nextRefreshToken,
    expiresIn: access.expiresIn,
    user: sanitizeUser(user),
  };
}

export async function logout({
  refreshToken,
  surface,
}: {
  refreshToken: string;
  surface: Surface;
}): Promise<void> {
  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  const storedToken = await tokenService.verifyRefreshToken(refreshToken);
  if (storedToken.surface !== surface) {
    throw ApiError.forbidden("Refresh token scope mismatch");
  }

  await tokenService.revokeSession(storedToken.session, "logout");
}

export async function getAuthenticatedProfile(
  userId: string | Types.ObjectId
): Promise<SanitizedUser> {
  const user = (await User.findById(userId)) as IUserDocument | null;
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return sanitizeUser(user);
}

export async function updateProfile({
  userId,
  data,
}: {
  userId: string | Types.ObjectId;
  data: { firstName?: string; lastName?: string; email?: string };
}): Promise<{ user: SanitizedUser }> {
  const user = (await User.findById(userId)) as IUserDocument | null;
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const { firstName, lastName, email } = data;

  if (email && email !== user.email) {
    const existing = await User.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existing) {
      throw ApiError.badRequest("Email already in use");
    }
    user.email = email;
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  await user.save();

  return { user: sanitizeUser(user) };
}
