import { Router } from "express";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import plansController from "../controllers/plans.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"));

router.get("/", plansController.list);

export default router;
