import { Router } from "express";
import * as staff from "../controllers/staff.controller";
import { requiredAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.use(requiredAuth, requireRole("admin"));

router.patch("/users/:userId/role", staff.changeRole);

export default router;