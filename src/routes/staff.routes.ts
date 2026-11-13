import { Router } from "express";
import * as review from "../controllers/review.controller"
import { requiredAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";


const router=Router();

router.use(requiredAuth,requireRole("reviewer","admin") )

router.get("/review-queue", review.listQueue)
router.get("/products/:productId", review.getSubmission)
router.post("/products/:productId/review", review.reviewProduct)

export default router;