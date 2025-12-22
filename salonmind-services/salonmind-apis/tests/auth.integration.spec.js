const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const User = require("../src/models/User");
const Salon = require("../src/models/Salon");
const env = require("../src/config/env");

const OTP_CODE = "123456";
const ADMIN_PHONE = "+15550000001";
const OWNER_PHONE = "+15550000002";
const EMPLOYEE_PHONE = "+15550000003";

const SESSION_ID_REGEX = /^[a-f0-9]{24}$/i;

const buildSendOtp = (surface) => `/v1/auth/${surface}/otp/send`;
const buildResendOtp = (surface) => `/v1/auth/${surface}/otp/resend`;
const buildVerifyOtp = (surface) => `/v1/auth/${surface}/otp/verify`;
const buildRefresh = (surface) => `/v1/auth/${surface}/token/refresh`;
const buildLogout = (surface) => `/v1/auth/${surface}/logout`;

const seedAdminUser = () =>
  User.create({
    phoneNumber: ADMIN_PHONE,
    role: "ADMIN",
    isProfileComplete: true,
    isOnboarded: true,
  });

const seedOwnerUser = () =>
  User.create({
    phoneNumber: OWNER_PHONE,
    role: "SALON_OWNER",
    isProfileComplete: true,
  });

const seedEmployeeUser = async ({ isActive = true } = {}) => {
  const owner = await seedOwnerUser();
  const salon = await Salon.create({
    name: "Employee Salon",
    owner: owner._id,
    contact: {
      email: "employee@salonmind.test",
      phone: OWNER_PHONE,
    },
    address: {
      street: "123 Street",
      city: "City",
      state: "State",
      zipCode: "123456",
      country: "India",
    },
    businessHours: [
      { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    ],
  });

  return User.create({
    phoneNumber: EMPLOYEE_PHONE,
    role: "SALON_EMPLOYEE",
    salon: salon._id,
    isActive,
  });
};

const completeOtpFlow = async (surface, phone, extraPayload = {}) => {
  const sendRes = await request(app)
    .post(buildSendOtp(surface))
    .send({ phone, ...extraPayload });
  const challengeId = sendRes.body.data.challengeId;
  const verifyRes = await request(app)
    .post(buildVerifyOtp(surface))
    .send({ challengeId, otp: OTP_CODE });
  return verifyRes.body.data;
};

describe("Auth module - OTP + token flows", () => {
  test("OTP cannot verify without challengeId", async () => {
    await seedOwnerUser();
    const response = await request(app)
      .post(buildVerifyOtp("salon-owner"))
      .send({ challengeId: "missing", otp: OTP_CODE });
    expect(response.status).toBe(400);
  });

  test("OTP cannot be reused", async () => {
    await seedOwnerUser();
    const sendRes = await request(app)
      .post(buildSendOtp("salon-owner"))
      .send({ phone: OWNER_PHONE });
    const challengeId = sendRes.body.data.challengeId;

    const firstVerify = await request(app)
      .post(buildVerifyOtp("salon-owner"))
      .send({ challengeId, otp: OTP_CODE });
    expect(firstVerify.status).toBe(200);

    const secondVerify = await request(app)
      .post(buildVerifyOtp("salon-owner"))
      .send({ challengeId, otp: OTP_CODE });
    expect(secondVerify.status).toBe(400);
  });

  test("Resend rotates challengeId", async () => {
    await seedOwnerUser();
    const sendRes = await request(app)
      .post(buildSendOtp("salon-owner"))
      .send({ phone: OWNER_PHONE });
    const challengeId = sendRes.body.data.challengeId;
    const resendRes = await request(app)
      .post(buildResendOtp("salon-owner"))
      .send({ challengeId });

    expect(resendRes.status).toBe(200);
    expect(resendRes.body.data.challengeId).not.toEqual(challengeId);
  });

  test("OTP is never returned in API responses", async () => {
    await seedOwnerUser();
    const sendRes = await request(app)
      .post(buildSendOtp("salon-owner"))
      .send({ phone: OWNER_PHONE });
    expect(sendRes.body.data).not.toHaveProperty("otp");
  });

  test("Refresh token cannot access protected APIs", async () => {
    await seedOwnerUser();
    const authData = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const protectedRes = await request(app)
      .get("/api/salons")
      .set("Authorization", `Bearer ${authData.refreshToken}`);
    expect(protectedRes.status).toBe(401);
  });

  test("Refresh rotation invalidates old token", async () => {
    await seedOwnerUser();
    const authData = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const refreshRes = await request(app)
      .post(buildRefresh("salon-owner"))
      .send({ refreshToken: authData.refreshToken });
    expect(refreshRes.status).toBe(200);

    const reuseRes = await request(app)
      .post(buildRefresh("salon-owner"))
      .send({ refreshToken: authData.refreshToken });
    expect(reuseRes.status).toBe(401);
  });

  test("Admin login blocked without allowlist", async () => {
    const response = await request(app)
      .post(buildSendOtp("admin"))
      .send({ phone: "+19999999999" });
    expect(response.status).toBe(403);
  });

  test("Allowlisted admin receives ADMIN scope tokens", async () => {
    await seedAdminUser();
    const data = await completeOtpFlow("admin", ADMIN_PHONE);
    expect(data.user.role).toBe("ADMIN");
  });

  test("Employee login blocked if not active", async () => {
    await seedEmployeeUser({ isActive: false });
    const sendRes = await request(app)
      .post(buildSendOtp("salon-employee"))
      .send({ phone: EMPLOYEE_PHONE });
    const challengeId = sendRes.body.data.challengeId;
    const verifyRes = await request(app)
      .post(buildVerifyOtp("salon-employee"))
      .send({ challengeId, otp: OTP_CODE });
    expect(verifyRes.status).toBe(403);
  });

  test("Role cannot be injected from client", async () => {
    await seedOwnerUser();
    const data = await completeOtpFlow("salon-owner", OWNER_PHONE, {
      role: "ADMIN",
    });
    expect(data.user.role).toBe("SALON_OWNER");
  });

  test("Access token payload includes ObjectId sessionId", async () => {
    await seedOwnerUser();
    const data = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const payload = jwt.decode(data.accessToken);
    expect(payload.sessionId).toMatch(SESSION_ID_REGEX);
    expect(payload.surface).toBe("SALON_OWNER");
  });

  test("Refresh token returns new access token with sessionId string", async () => {
    await seedOwnerUser();
    const data = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const refreshRes = await request(app)
      .post(buildRefresh("salon-owner"))
      .send({ refreshToken: data.refreshToken });
    expect(refreshRes.status).toBe(200);
    const payload = jwt.decode(refreshRes.body.data.accessToken);
    expect(payload.sessionId).toMatch(SESSION_ID_REGEX);
  });

  test("Owner context succeeds with valid access token", async () => {
    await seedOwnerUser();
    const data = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const contextRes = await request(app)
      .get("/v1/owner/me/context")
      .set("Authorization", `Bearer ${data.accessToken}`);
    expect(contextRes.status).toBe(200);
    expect(contextRes.body.data.tenant).toBeDefined();
  });

  test("Invalid sessionId in token is rejected with 401", async () => {
    await seedOwnerUser();
    const data = await completeOtpFlow("salon-owner", OWNER_PHONE);
    const original = jwt.decode(data.accessToken);
    const forgedToken = jwt.sign(
      {
        sub: original.sub,
        sessionId: new mongoose.Types.ObjectId().toHexString(),
        surface: original.surface,
        tokenType: "ACCESS",
      },
      env.jwtAccessSecret,
      { expiresIn: Math.floor(env.surfaces.SALON_OWNER.accessTtlMs / 1000) }
    );

    const res = await request(app)
      .get("/v1/owner/me/context")
      .set("Authorization", `Bearer ${forgedToken}`);
    expect(res.status).toBe(401);
  });
});
