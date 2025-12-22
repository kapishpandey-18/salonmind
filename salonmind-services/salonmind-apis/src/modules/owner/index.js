const mountOwnerModule = (app) => {
  const onboardingRoutes = require("./routes/onboarding.routes");
  const branchRoutes = require("./routes/branches.routes");
  const staffRoutes = require("./routes/staff.routes");
  const servicesRoutes = require("./routes/services.routes");
  const clientsRoutes = require("./routes/clients.routes");
  const appointmentsRoutes = require("./routes/appointments.routes");
  const ownerRoutes = require("./routes/owner.routes");
  const { ensureDefaultPlansSeeded } = require("./services/subscription.service");

  ensureDefaultPlansSeeded().catch((error) => {
    console.error("Failed to seed subscription plans", error);
  });

  app.use("/v1/owner/onboarding", onboardingRoutes);
  app.use("/v1/owner/branches", branchRoutes);
  app.use("/v1/owner/staff", staffRoutes);
  app.use("/v1/owner/services", servicesRoutes);
  app.use("/v1/owner/clients", clientsRoutes);
  app.use("/v1/owner/appointments", appointmentsRoutes);
  app.use("/v1/owner", ownerRoutes);
};

module.exports = mountOwnerModule;
