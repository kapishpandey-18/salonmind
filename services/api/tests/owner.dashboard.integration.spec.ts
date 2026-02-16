import request from "supertest";

import app from "../src/app.js";
import User from "../src/models/User.js";

const OTP_CODE = "123456";

interface AuthData {
  accessToken: string;
  user: { id: string; tenant: string };
}

const loginOwner = async (phone: string): Promise<AuthData> => {
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
    ownerName: "Dashboard Owner",
    salonName: "Dashboard Salon",
    email: "dashboard@salonmind.com",
    salonEmail: "info@salonmind.com",
    salonPhoneNumber: "9999999999",
    salonAddress: "Road 1",
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

const runOnboarding = async ({
  token,
  planCode = "PRO",
}: {
  token: string;
  planCode?: string;
}): Promise<string> => {
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

  await request(app)
    .post("/v1/owner/onboarding/confirm")
    .set("Authorization", `Bearer ${token}`)
    .send({
      orderId: order.id,
      paymentId: "pay_test",
      signature: "sig_test",
    });

  const contextRes = await request(app)
    .get("/v1/owner/me/context")
    .set("Authorization", `Bearer ${token}`);

  return contextRes.body.data?.activeBranchId;
};

const bootstrapOwner = async (
  phone: string
): Promise<{ auth: AuthData; branchId: string }> => {
  const auth = await loginOwner(phone);
  const branchId = await runOnboarding({ token: auth.accessToken });
  return { auth, branchId };
};

describe("Owner dashboard APIs", () => {
  test("context endpoint falls back when X-Branch-Id missing or invalid", async () => {
    const { auth, branchId } = await bootstrapOwner("+15551110001");

    const branchRes = await request(app)
      .post("/v1/owner/branches")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ name: "Downtown" });

    expect(branchRes.status).toBe(201);

    const contextRes = await request(app)
      .get("/v1/owner/me/context")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", "invalid-branch-id");

    expect(contextRes.status).toBe(200);
    expect(contextRes.body.data.activeBranchId).toBeDefined();

    const validContext = await request(app)
      .get("/v1/owner/me/context")
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(validContext.status).toBe(200);
    expect(validContext.body.data.activeBranchId).toBeDefined();
    expect(validContext.body.data.activeBranchId.toString()).toEqual(
      branchId.toString()
    );
  });

  test("set active branch persists to user", async () => {
    const { auth } = await bootstrapOwner("+15551110002");

    const newBranch = await request(app)
      .post("/v1/owner/branches")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ name: "Uptown" });

    const secondBranchId = newBranch.body.data.branch._id;

    const res = await request(app)
      .post("/v1/owner/branches/active")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ branchId: secondBranchId });

    expect(res.status).toBe(200);

    const user = await User.findById(auth.user.id);
    expect(user!.activeBranch?.toString()).toEqual(secondBranchId.toString());
  });

  test("staff CRUD endpoints work for branch scope", async () => {
    const { auth, branchId } = await bootstrapOwner("+15551110003");

    const createRes = await request(app)
      .post("/v1/owner/staff")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({ name: "Noah Lee", role: "Stylist", email: "noah@test.com" });

    expect(createRes.status).toBe(201);
    const staffId = createRes.body.data.staff._id;

    const listRes = await request(app)
      .get("/v1/owner/staff")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);

    expect(listRes.body.data.staff.length).toBeGreaterThan(0);

    const updateRes = await request(app)
      .patch(`/v1/owner/staff/${staffId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ role: "Senior Stylist" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.staff.role).toBe("Senior Stylist");

    const deleteRes = await request(app)
      .delete(`/v1/owner/staff/${staffId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(deleteRes.status).toBe(200);
  });

  test("services CRUD endpoints work for branch scope", async () => {
    const { auth, branchId } = await bootstrapOwner("+15551110004");

    const createRes = await request(app)
      .post("/v1/owner/services")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({ name: "Blow Dry", duration: 30, price: 400 });

    expect(createRes.status).toBe(201);
    const serviceId = createRes.body.data.service._id;

    const listRes = await request(app)
      .get("/v1/owner/services")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.services.length).toBeGreaterThan(0);

    const updateRes = await request(app)
      .patch(`/v1/owner/services/${serviceId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ price: 450 });

    expect(updateRes.body.data.service.price).toBe(450);

    const deleteRes = await request(app)
      .delete(`/v1/owner/services/${serviceId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(deleteRes.status).toBe(200);
  });

  test("clients CRUD endpoints support pagination/search", async () => {
    const { auth, branchId } = await bootstrapOwner("+15551110005");

    const createRes = await request(app)
      .post("/v1/owner/clients")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({
        fullName: "Priya Sharma",
        phoneNumber: "+919876543210",
        email: "priya@example.com",
        gender: "female",
        tags: ["VIP"],
      });

    expect(createRes.status).toBe(201);
    const clientId = createRes.body.data.client._id;

    const listRes = await request(app)
      .get("/v1/owner/clients")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .query({ search: "priya", page: 1, limit: 5 });

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.clients.length).toBeGreaterThan(0);
    expect(listRes.body.pagination).toBeDefined();

    const detailRes = await request(app)
      .get(`/v1/owner/clients/${clientId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);
    expect(detailRes.status).toBe(200);

    const updateRes = await request(app)
      .patch(`/v1/owner/clients/${clientId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ notes: "Prefers morning appointments" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.client.notes).toContain("morning");

    const deleteRes = await request(app)
      .delete(`/v1/owner/clients/${clientId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(deleteRes.status).toBe(200);
  });

  test("appointments CRUD endpoints support multi-service payloads", async () => {
    const { auth, branchId } = await bootstrapOwner("+15551110006");

    const clientsRes = await request(app)
      .post("/v1/owner/clients")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({
        fullName: "Rahul Client",
        phoneNumber: "+919911223344",
      });
    const clientId = clientsRes.body.data.client._id;

    const staffRes = await request(app)
      .get("/v1/owner/staff")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);
    const staffId = staffRes.body.data.staff[0]._id;

    const servicesRes = await request(app)
      .get("/v1/owner/services")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId);
    const serviceIds = servicesRes.body.data.services
      .slice(0, 2)
      .map((service: { _id: string }) => service._id);

    const startAt = new Date().toISOString();

    const createRes = await request(app)
      .post("/v1/owner/appointments")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({
        clientId,
        staffId,
        serviceIds,
        startAt,
        status: "confirmed",
      });

    expect(createRes.status).toBe(201);
    const appointmentId = createRes.body.data.appointment._id;

    const listRes = await request(app)
      .get("/v1/owner/appointments")
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .query({ page: 1, limit: 5, search: "Rahul" });

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.appointments.length).toBeGreaterThan(0);

    const updateRes = await request(app)
      .patch(`/v1/owner/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .send({ notes: "Bring loyalty card", status: "completed" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.appointment.status).toBe("completed");

    const deleteRes = await request(app)
      .delete(`/v1/owner/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${auth.accessToken}`);

    expect(deleteRes.status).toBe(200);
  });

  test("tenant scoping prevents editing another salon's staff", async () => {
    const { auth: ownerOneAuth, branchId } = await bootstrapOwner(
      "+15551110007"
    );
    const { auth: ownerTwoAuth } = await bootstrapOwner("+15551110008");

    const staffRes = await request(app)
      .post("/v1/owner/staff")
      .set("Authorization", `Bearer ${ownerOneAuth.accessToken}`)
      .set("X-Branch-Id", branchId)
      .send({ name: "Scope Guard", email: "guard@example.com" });

    const staffId = staffRes.body.data.staff._id;

    const forbiddenUpdate = await request(app)
      .patch(`/v1/owner/staff/${staffId}`)
      .set("Authorization", `Bearer ${ownerTwoAuth.accessToken}`)
      .send({ role: "Intruder" });

    expect(forbiddenUpdate.status).toBe(404);
  });
});
