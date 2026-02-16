import buildController from "./baseAuth.controller.js";
import { SURFACES } from "../services/auth.service.js";

export default buildController(SURFACES.SALON_EMPLOYEE);
