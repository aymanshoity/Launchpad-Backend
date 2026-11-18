import { RequestHandler } from "express";
import z from "zod";
import { AppError } from "../utils/AppError";
import * as launchService from "../services/launch.service";
const paramsSchema = z.object({ productId: z.string().uuid() })
const bodySchema = z.object({ launchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });


export const scheduleLaunch: RequestHandler = async (req, res) => {
   const { productId } = paramsSchema.parse(req.params)
   const { launchDate } = bodySchema.parse(req.body)

   const date = new Date(`${launchDate}T00:00:00Z`)

   if (Number.isNaN(date.getTime())) throw new AppError(400, 'Invalid date')

   const product = await launchService.scheduleLaunch(productId, res.locals.userId, date)
   res.status(200).json({ product, message: 'Launch Scheduled', status: 200 })
}

export const runGoLive: RequestHandler = async (_req, res) => {
  const launched = await launchService.goLive();
  res.json({ launched });
};