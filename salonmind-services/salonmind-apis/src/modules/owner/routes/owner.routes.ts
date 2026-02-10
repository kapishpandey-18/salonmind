import { Router } from "express";
import { authenticate, restrictToScope } from "../../../middleware/auth.js";
import ownerController from "../controllers/owner.controller.js";

const router = Router();

router.use(authenticate, restrictToScope("SALON_OWNER"));

router.get("/me/context", ownerController.context);

export default router;
