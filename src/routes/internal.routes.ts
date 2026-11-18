import { RequestHandler, Router } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import * as launch from "../controllers/launch.controller";

const requireCronSecret: RequestHandler = async (req, res, next) => {
   if (req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
      throw new AppError(401, "Unauthorized");
   }
   next()
}

const router = Router();

router.get("/cron/go-live",requireCronSecret,launch.runGoLive)

export default router;