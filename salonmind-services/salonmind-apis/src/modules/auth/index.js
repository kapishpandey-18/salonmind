const adminRoutes = require("./routes/adminAuth.routes");
const salonOwnerRoutes = require("./routes/salonOwnerAuth.routes");
const salonEmployeeRoutes = require("./routes/salonEmployeeAuth.routes");

const mountAuthModule = (app) => {
  app.use("/v1/auth/admin", adminRoutes);
  app.use("/v1/auth/salon-owner", salonOwnerRoutes);
  app.use("/v1/auth/salon-employee", salonEmployeeRoutes);
};

module.exports = mountAuthModule;
