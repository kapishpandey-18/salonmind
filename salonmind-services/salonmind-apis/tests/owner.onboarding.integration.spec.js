const request = require("supertest");

const app = require("../src/app");
const User = require("../src/models/User");
const Branch = require("../src/models/Branch");
const TenantSubscription = require("../src/models/TenantSubscription");

const OTP_CODE = "123456";
const OWNER_PHONE = "+15550000002";

const loginOwner = async (phone = OWNER_PHONE) => {
  const sendRes = await request(app)
    .post("/v1/auth/salon-owner/otp/send")
    .send({ phone });
  const challengeId = sendRes.body.data.challengeId;

  const verifyRes = await request(app)
    .post("/v1/auth/salon-owner/otp/verify")
    .send({ challengeId, otp: OTP_CODE });

  return verifyRes.body.data;
};

const onboardingPayloads = {
  profile: {
    ownerName: "Test Owner",
    salonName: "Test Salon",
    email: "owner@test.com",
    salonEmail: "salon@test.com",
    salonPhoneNumber: "9999999999",
    salonAddress: "123 Street",
    salonCity: "Mumbai",
    salonState: "MH",
    salonZipCode: "400001",
  },
  hours: [
    { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "saturday", isOpen: true, openTime: "10:00", closeTime: "17:00" },
    { day: "sunday", isOpen: false, openTime: "10:00", closeTime: "17:00" },
  ],
  services: [
    { name: "Cut", duration: "45", price: 500 },
    { name: "Color", duration: "60", price: 900 },
    { name: "Spa", duration: "90", price: 1500 },
  ],
  staff: [{ name: "Lisa", role: "Stylist", email: "lisa@test.com" }],
};

const runBaseOnboarding = async ({ token, planCode = "BASIC" }) => {
  await request(app)
    .put("/v1/owner/onboarding/profile")
    .set("Authorization", `Bearer ${token}`)
    .send(onboardingPayloads.profile);

  await request(app)
    .put("/v1/owner/onboarding/business-hours")
    .set("Authorization", `Bearer ${token}`)
    .send({ businessHours: onboardingPayloads.hours });

  await request(app)
    .put("/v1/owner/onboarding/services")
    .set("Authorization", `Bearer ${token}`)
    .send({ services: onboardingPayloads.services });

  await request(app)
    .put("/v1/owner/onboarding/staff")
    .set("Authorization", `Bearer ${token}`)
    .send({ staff: onboardingPayloads.staff });

  const checkoutRes = await request(app)
    .post("/v1/owner/onboarding/checkout")
    .set("Authorization", `Bearer ${token}`)
    .send({ planCode });

  const { order } = checkoutRes.body.data;

  const confirmRes = await request(app)
    .post("/v1/owner/onboarding/confirm")
    .set("Authorization", `Bearer ${token}`)
    .send({
      orderId: order.id,
      paymentId: "pay_test",
      signature: "sig_test",
    });

  return confirmRes.body.data;
};

describe("Owner onboarding + subscription", () => {
  test("confirm onboarding creates subscription + default branch + flags user onboarded", async () => {
    const auth = await loginOwner();
    const context = await runBaseOnboarding({ token: auth.accessToken });

    expect(context.defaultBranchId).toBeDefined();
    expect(context.branches).toHaveLength(1);

    const subscription = await TenantSubscription.findOne({
      tenant: auth.user.tenant,
    });
    expect(subscription).toBeTruthy();
    expect(subscription.status).toBe("ACTIVE");

    const branches = await Branch.find({ tenant: auth.user.tenant });
    expect(branches).toHaveLength(1);
    expect(branches[0].isDefault).toBe(true);

    const user = await User.findById(auth.user.id);
    expect(user.isOnboarded).toBe(true);
    expect(user.activeBranch?.toString()).toEqual(
      branches[0]._id.toString()
    );
  });

  test("branch create blocked when BASIC plan already has 1 branch", async () => {
    const auth = await loginOwner("+15550000011");
    await runBaseOnboarding({ token: auth.accessToken });

    const res = await request(app)
      .post("/v1/owner/branches")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ name: "Second Branch" });

    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/Plan limit reached/i);
  });

  test("staff create blocked when BASIC and already has 10 active staff", async () => {
    const auth = await loginOwner("+15550000012");
    await runBaseOnboarding({ token: auth.accessToken });

    const staffEntries = Array.from({ length: 11 }).map((_, index) => ({
      name: `Staff ${index}`,
      role: "Stylist",
      email: `staff${index}@test.com`,
    }));

    const res = await request(app)
      .put("/v1/owner/onboarding/staff")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ staff: staffEntries });

    expect(res.status).toBe(400);
    expect(res.body.error?.message).toMatch(/Plan limit reached/i);
  });

  test("requireActiveSubscription blocks branch APIs when subscription missing", async () => {
    const auth = await loginOwner("+15550000013");
    const res = await request(app)
      .get("/v1/owner/branches")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error?.message).toMatch(/Active subscription required/i);
  });

  test("tenant context returns default branch id", async () => {
    const auth = await loginOwner("+15550000014");
    await runBaseOnboarding({ token: auth.accessToken });

    const res = await request(app)
      .get("/v1/owner/me/context")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(res.status).toBe(200);
    const { activeBranchId, branches } = res.body.data;

    expect(activeBranchId).toBeDefined();
    expect(branches).toHaveLength(1);
    expect(branches[0].id.toString()).toEqual(activeBranchId.toString());
  });

  test("onboarding seeds staff and services collections for the default branch", async () => {
    const auth = await loginOwner("+15550000015");
    const context = await runBaseOnboarding({ token: auth.accessToken });

    const branchId = context.defaultBranchId;
    expect(branchId).toBeDefined();

    const staffRes = await request(app)
      .get("/v1/owner/staff")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);

    expect(staffRes.status).toBe(200);
    expect(staffRes.body.data.staff.length).toBeGreaterThan(0);

    const servicesRes = await request(app)
      .get("/v1/owner/services")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);

    expect(servicesRes.status).toBe(200);
    expect(servicesRes.body.data.services.length).toBeGreaterThan(0);
  });
});
