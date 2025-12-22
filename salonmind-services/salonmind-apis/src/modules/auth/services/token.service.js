const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const env = require("../../../config/env");
const RefreshToken = require("../models/RefreshToken.model");
const Session = require("../models/Session.model");
const ApiError = require("../../../utils/ApiError");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

async function createSession({ userId, surface, ip, userAgent }) {
  return Session.create({
    user: userId,
    surface,
    createdByIp: ip,
    userAgent,
    lastUsedAt: new Date(),
  });
}

function normalizeSessionId(sessionId) {
  if (!sessionId) {
    return null;
  }
  if (typeof sessionId === "string") {
    return sessionId;
  }
  if (typeof sessionId.toHexString === "function") {
    return sessionId.toHexString();
  }
  if (sessionId._id) {
    return normalizeSessionId(sessionId._id);
  }
  if (typeof sessionId.toString === "function") {
    const converted = sessionId.toString();
    if (converted !== "[object Object]") {
      return converted;
    }
  }
  return null;
}

function generateAccessToken({ userId, surface, sessionId }) {
  const ttl = env.surfaces[surface].accessTtlMs;
  const normalizedSessionId = normalizeSessionId(sessionId);

  if (!normalizedSessionId || !mongoose.Types.ObjectId.isValid(normalizedSessionId)) {
    throw ApiError.internal("Invalid session identifier for token");
  }

  const payload = {
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

async function generateRefreshToken({ userId, surface, sessionId, ip }) {
  const ttl = env.surfaces[surface].refreshTtlMs;
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttl);

  const doc = await RefreshToken.create({
    user: userId,
    session: sessionId,
    surface,
    tokenHash,
    expiresAt,
    createdByIp: ip,
  });

  return {
    token,
    expiresIn: ttl,
    doc,
  };
}

function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    if (payload.tokenType !== "ACCESS") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch (error) {
    throw ApiError.unauthorized("Invalid access token");
  }
}

async function verifyRefreshToken(token) {
  const tokenHash = hashToken(token);
  const doc = await RefreshToken.findOne({ tokenHash }).populate("session");

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

async function rotateRefreshToken(oldTokenDoc, { ip, session }) {
  const sessionDoc =
    session ||
    (await Session.findById(
      oldTokenDoc.session?._id ? oldTokenDoc.session._id : oldTokenDoc.session
    ));

  if (!sessionDoc || !sessionDoc.isActive) {
    throw ApiError.unauthorized("Session is invalid");
  }
  sessionDoc.lastUsedAt = new Date();
  await sessionDoc.save();

  oldTokenDoc.revokedAt = new Date();
  oldTokenDoc.revokedReason = "rotated";
  await oldTokenDoc.save();

  const { token, doc } = await generateRefreshToken({
    userId: oldTokenDoc.user,
    surface: oldTokenDoc.surface,
    sessionId: sessionDoc._id,
    ip,
  });

  oldTokenDoc.replacedByTokenHash = doc.tokenHash;
  await oldTokenDoc.save();

  return { token, doc, session: sessionDoc };
}

async function revokeSession(sessionId, reason) {
  const session = await Session.findById(sessionId);
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

module.exports = {
  createSession,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeSession,
};
