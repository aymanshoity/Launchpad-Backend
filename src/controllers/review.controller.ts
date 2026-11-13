import { RequestHandler } from "express";
import {z} from "zod"
import * as reviewService from "../services/review.service"


const paramsSchema = z.object({ productId: z.string().uuid() });

const reviewSchema = z.object({
   decision: z.enum(["approved", "rejected", "changes_requested"]),
   note: z.string().trim().max(2000).optional(),
}).refine(
   (d) => d.decision === "approved" || !!d.note,
   {
      message: "A note is required when rejecting or requesting changes",
      path: ["note"],
   },
);

export const listQueue:RequestHandler=async(_req,res)=>{
   const product=await reviewService.listReviewQueue();
   res.status(200).json({ product, status: 200 })
   
}
export const getSubmission:RequestHandler=async(req,res)=>{
 const { productId } = paramsSchema.parse(req.params)
 const product=await reviewService.getSubmission(productId);
 res.status(200).json({ product, status: 200 })
}

export const reviewProduct:RequestHandler=async(req,res)=>{
const { productId } = paramsSchema.parse(req.params)
const body=reviewSchema.parse(req.body);
const product=await reviewService.reviewProduct({ productId, reviewerId: res.locals.userId, input: body, ip: req.ip })
res.status(200).json({ product, message:"Review Saved",status: 200 })
}