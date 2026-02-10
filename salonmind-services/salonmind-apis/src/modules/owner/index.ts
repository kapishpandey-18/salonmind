import type { Express } from "express";
import onboardingRoutes from "./routes/onboarding.routes.js";
import branchRoutes from "./routes/branches.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import productsRoutes from "./routes/products.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import revenueRoutes from "./routes/revenue.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import plansRoutes from "./routes/plans.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import { ensureDefaultPlansSeeded } from "./services/subscription.service.js";

const mountOwnerModule = (app: Express): void => {
  ensureDefaultPlansSeeded().catch((error: unknown) => {
    console.error("Failed to seed subscription plans", error);
  });

  app.use("/v1/owner/onboarding", onboardingRoutes);
  app.use("/v1/owner/branches", branchRoutes);
  app.use("/v1/owner/staff", staffRoutes);
  app.use("/v1/owner/services", servicesRoutes);
  app.use("/v1/owner/clients", clientsRoutes);
  app.use("/v1/owner/appointments", appointmentsRoutes);
  app.use("/v1/owner/products", productsRoutes);
  app.use("/v1/owner/inventory", inventoryRoutes);
  app.use("/v1/owner/revenue", revenueRoutes);
  app.use("/v1/owner/reports", reportsRoutes);
  app.use("/v1/owner/settings", settingsRoutes);
  app.use("/v1/owner/plans", plansRoutes);
  app.use("/v1/owner", ownerRoutes);
};

export default mountOwnerModule;
