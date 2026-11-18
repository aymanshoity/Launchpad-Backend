import { Router } from "express";
import * as staff from "../controllers/staff.controller";
import { requiredAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import * as topics from "../controllers/topics.controller";
const router = Router();

router.use(requiredAuth, requireRole("admin"));

router.patch("/users/:userId/role", staff.changeRole);
router.post("/topics", topics.createTopic);

export default router;