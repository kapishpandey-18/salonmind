const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");

const OtpChallenge = require("../models/OtpChallenge.model");
const ApiError = require("../../../utils/ApiError");
const env = require("../../../config/env");

const normalizePhone = (phone) => {
  if (!phone) {
    throw ApiError.badRequest("Phone number is required");
  }
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+")) {
    throw ApiError.badRequest("Phone must be in E.164 format (e.g. +15551234567)");
  }
  if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) {
    throw ApiError.badRequest("Invalid phone number format");
  }
  return trimmed;
};

const generateOtp = () => crypto.randomInt(100000, 999999).toString();
const getOtpValue = () => {
  if (process.env.NODE_ENV === "test" && process.env.OTP_TEST_CODE) {
    return process.env.OTP_TEST_CODE;
  }
  return generateOtp();
};

async function createChallenge({ phone, surface, meta }) {
  const normalizedPhone = normalizePhone(phone);

  await OtpChallenge.updateMany(
    {
      phone: normalizedPhone,
      surface,
      status: "ACTIVE",
    },
    { status: "LOCKED", lockReason: "superseded" }
  );

  const otp = getOtpValue();
  const otpHash = await bcrypt.hash(otp, 10);
  const challenge = await OtpChallenge.create({
    challengeId: uuid(),
    phone: normalizedPhone,
    surface,
    otpHash,
    expiresAt: new Date(Date.now() + env.otpTtlMs),
    attempts: 0,
    maxAttempts: env.otpMaxAttempts,
    resendCount: 0,
    meta,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[OTP:${surface}] ${normalizedPhone} code: ${otp}`);
  }

  return {
    challengeId: challenge.challengeId,
    expiresIn: env.otpTtlMs,
  };
}

async function verifyChallenge({ challengeId, otp }) {
  const challenge = await OtpChallenge.findOne({ challengeId });

  if (!challenge || challenge.status !== "ACTIVE") {
    throw ApiError.badRequest("Invalid or expired OTP challenge");
  }

  if (challenge.expiresAt < new Date()) {
    challenge.status = "LOCKED";
    challenge.lockReason = "expired";
    await challenge.save();
    throw ApiError.badRequest("OTP challenge expired");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    challenge.status = "LOCKED";
    challenge.lockReason = "max-attempts";
    await challenge.save();
    throw ApiError.badRequest("OTP attempts exceeded");
  }

  const isValid = await bcrypt.compare(otp, challenge.otpHash);
  if (!isValid) {
    challenge.attempts += 1;
    if (challenge.attempts >= challenge.maxAttempts) {
      challenge.status = "LOCKED";
      challenge.lockReason = "max-attempts";
    }
    await challenge.save();
    throw ApiError.badRequest("Invalid OTP");
  }

  challenge.status = "USED";
  await challenge.save();

  return {
    phone: challenge.phone,
    surface: challenge.surface,
  };
}

async function resendChallenge({ challengeId, surface }) {
  const existing = await OtpChallenge.findOne({ challengeId });
  if (!existing || existing.status !== "ACTIVE") {
    throw ApiError.badRequest("Challenge cannot be resent");
  }

  if (existing.surface !== surface) {
    throw ApiError.badRequest("Challenge surface mismatch");
  }

  if (existing.resendCount >= env.otpMaxResends) {
    existing.status = "LOCKED";
    existing.lockReason = "resend-limit";
    await existing.save();
    throw ApiError.badRequest("OTP resend limit exceeded");
  }

  existing.status = "LOCKED";
  existing.lockReason = "rotated";
  await existing.save();

  const otp = getOtpValue();
  const newChallenge = await OtpChallenge.create({
    challengeId: uuid(),
    phone: existing.phone,
    surface: existing.surface,
    otpHash: await bcrypt.hash(otp, 10),
    expiresAt: new Date(Date.now() + env.otpTtlMs),
    attempts: 0,
    maxAttempts: env.otpMaxAttempts,
    resendCount: existing.resendCount + 1,
    meta: existing.meta,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[OTP:${existing.surface}] ${existing.phone} code: ${otp}`);
  }

  return {
    challengeId: newChallenge.challengeId,
    expiresIn: env.otpTtlMs,
  };
}

module.exports = {
  createChallenge,
  verifyChallenge,
  resendChallenge,
};
