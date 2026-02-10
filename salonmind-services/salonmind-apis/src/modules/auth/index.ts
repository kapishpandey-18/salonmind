import type { Express } from "express";
import adminRoutes from "./routes/adminAuth.routes.js";
import salonOwnerRoutes from "./routes/salonOwnerAuth.routes.js";
import salonEmployeeRoutes from "./routes/salonEmployeeAuth.routes.js";

const mountAuthModule = (app: Express): void => {
  app.use("/v1/auth/admin", adminRoutes);
  app.use("/v1/auth/salon-owner", salonOwnerRoutes);
  app.use("/v1/auth/salon-employee", salonEmployeeRoutes);
};

export default mountAuthModule;
