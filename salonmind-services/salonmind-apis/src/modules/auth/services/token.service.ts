import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import env from "../../../config/env.js";
import RefreshToken from "../models/RefreshToken.model.js";
import Session from "../models/Session.model.js";
import type { ISessionDocument } from "../models/Session.model.js";
import type { IRefreshTokenDocument } from "../models/RefreshToken.model.js";
import ApiError from "../../../utils/ApiError.js";
import type { Surface, AccessTokenPayload } from "../../../types/index.js";
import type { Types } from "mongoose";

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function createSession({
  userId,
  surface,
  ip,
  userAgent,
}: {
  userId: Types.ObjectId;
  surface: Surface;
  ip?: string;
  userAgent?: string;
}): Promise<ISessionDocument> {
  return Session.create({
    user: userId,
    surface,
    createdByIp: ip,
    userAgent,
    lastUsedAt: new Date(),
  }) as Promise<ISessionDocument>;
}

function normalizeSessionId(
  sessionId: unknown
): string | null {
  if (!sessionId) {
    return null;
  }
  if (typeof sessionId === "string") {
    return sessionId;
  }
  if (
    typeof sessionId === "object" &&
    sessionId !== null &&
    "toHexString" in sessionId &&
    typeof (sessionId as { toHexString: () => string }).toHexString === "function"
  ) {
    return (sessionId as { toHexString: () => string }).toHexString();
  }
  if (
    typeof sessionId === "object" &&
    sessionId !== null &&
    "_id" in sessionId
  ) {
    return normalizeSessionId(
      (sessionId as { _id: unknown })._id
    );
  }
  if (
    typeof sessionId === "object" &&
    sessionId !== null &&
    "toString" in sessionId
  ) {
    const converted = (sessionId as { toString: () => string }).toString();
    if (converted !== "[object Object]") {
      return converted;
    }
  }
  return null;
}

export function generateAccessToken({
  userId,
  surface,
  sessionId,
}: {
  userId: Types.ObjectId;
  surface: Surface;
  sessionId: unknown;
}): { token: string; expiresIn: number } {
  const ttl = env.surfaces[surface].accessTtlMs;
  const normalizedSessionId = normalizeSessionId(sessionId);

  if (
    !normalizedSessionId ||
    !mongoose.Types.ObjectId.isValid(normalizedSessionId)
  ) {
    throw ApiError.internal("Invalid session identifier for token");
  }

  const payload: Omit<AccessTokenPayload, "exp"> = {
    sub: userId.toString(),
    sessionId: normalizedSessionId,
    surface,
    tokenType: "ACCESS",
    iat: Math.floor(Date.now() / 1000),
  };

  return {
    token: jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: Math.floor(ttl / 1000),
    }),
    expiresIn: ttl,
  };
}

export async function generateRefreshToken({
  userId,
  surface,
  sessionId,
  ip,
}: {
  userId: Types.ObjectId;
  surface: Surface;
  sessionId: Types.ObjectId;
  ip?: string;
}): Promise<{ token: string; expiresIn: number; doc: IRefreshTokenDocument }> {
  const ttl = env.surfaces[surface].refreshTtlMs;
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttl);

  const doc = (await RefreshToken.create({
    user: userId,
    session: sessionId,
    surface,
    tokenHash,
    expiresAt,
    createdByIp: ip,
  })) as IRefreshTokenDocument;

  return {
    token,
    expiresIn: ttl,
    doc,
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(
      token,
      env.jwtAccessSecret
    ) as AccessTokenPayload;
    if (payload.tokenType !== "ACCESS") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch {
    throw ApiError.unauthorized("Invalid access token");
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<IRefreshTokenDocument> {
  const tokenHash = hashToken(token);
  const doc = (await RefreshToken.findOne({ tokenHash }).populate(
    "session"
  )) as IRefreshTokenDocument | null;

  if (!doc) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  if (doc.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token expired");
  }

  if (doc.revokedAt) {
    throw ApiError.unauthorized("Refresh token revoked");
  }

  return doc;
}

export async function rotateRefreshToken(
  oldTokenDoc: IRefreshTokenDocument,
  { ip, session }: { ip?: string; session?: ISessionDocument }
): Promise<{
  token: string;
  doc: IRefreshTokenDocument;
  session: ISessionDocument;
}> {
  const sessionDoc =
    session ||
    ((await Session.findById(
      (oldTokenDoc.session as unknown as { _id?: Types.ObjectId })._id
        ? (oldTokenDoc.session as unknown as { _id: Types.ObjectId })._id
        : oldTokenDoc.session
    )) as ISessionDocument | null);

  if (!sessionDoc || !sessionDoc.isActive) {
    throw ApiError.unauthorized("Session is invalid");
  }
  sessionDoc.lastUsedAt = new Date();
  await sessionDoc.save();

  oldTokenDoc.revokedAt = new Date();
  oldTokenDoc.revokedReason = "rotated";
  await oldTokenDoc.save();

  const { token, doc } = await generateRefreshToken({
    userId: oldTokenDoc.user as Types.ObjectId,
    surface: oldTokenDoc.surface,
    sessionId: sessionDoc._id as Types.ObjectId,
    ip,
  });

  oldTokenDoc.replacedByTokenHash = doc.tokenHash;
  await oldTokenDoc.save();

  return { token, doc, session: sessionDoc };
}

export async function revokeSession(
  sessionId: Types.ObjectId | unknown,
  reason: string
): Promise<void> {
  const session = (await Session.findById(
    sessionId
  )) as ISessionDocument | null;
  if (!session) {
    return;
  }
  session.revoke(reason);
  await session.save();
  await RefreshToken.updateMany(
    { session: session._id, revokedAt: { $exists: false } },
    { revokedAt: new Date(), revokedReason: reason }
  );
}
