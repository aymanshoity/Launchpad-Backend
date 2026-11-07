import { Router } from "express";
import * as topics from '../controllers/topics.controller'

const router = Router();

router.get("/",topics.findListTopics)

export default router;