const buildController = require("./baseAuth.controller");
const { SURFACES } = require("../services/auth.service");

module.exports = buildController(SURFACES.SALON_EMPLOYEE);
