import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

type Decision = "approved" | "rejected" | "changes_requested";


const OUTCOME = {
   approved: { status: "approved", action: "approve_product" },
   rejected: { status: "rejected", action: "reject_product" },
   changes_requested: { status: "changes_requested", action: "request_product_changes" }
} as const

export const listReviewQueue = async () => {
   return await prisma.product.findMany({
      where: { status: "in_review" },
      orderBy: { submittedAt: "asc" },
      take: 50,
      select: {
         id: true,
         name: true,
         pitch: true,
         submittedAt: true,
         founder: { select: { id: true, username: true, email: true } },
      }
   })
}

export const getSubmission = async (productId: string) => {

   const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
         founder: { select: { id: true, username: true, email: true } },
         media: { orderBy: { position: "asc" } },
         topics: { include: { topic: true } },
         reviews: { orderBy: { createdAt: "desc" } }
      }
   })
   if (!product) {
      throw new AppError(404, "Product not found");
   }
   return product;
}

interface ReviewInput{
   productId: string;
   reviewerId: string;
   input: {
      decision: Decision;
      note?: string;
   }
   ip?: string;
}

export const reviewProduct = async (reviewInput: ReviewInput) => {

   const { productId, reviewerId, input, ip } = reviewInput;
   const outcome=OUTCOME[input.decision];
   return prisma.$transaction(async(tx)=>{
      const product=await tx.product.findUnique({
         where:{id:productId},
      })
      if(!product){
         throw new AppError(404,"Product not found");
      }
      if(product.founderId===reviewerId){
         throw new AppError(403,"Founders cannot review their own products");
      }

      const {count}=await tx.product.updateMany({
         where:{id:productId},
         data:{status:outcome.status},
      })

      if (count === 0) throw new AppError(409, "This product is not waiting for review");

      await tx.productReview.create({
         data:{productId,reviewerId,decision:input.decision,note:input.note}
      })

      await tx.staffAuditLog.create({
         data:{
            actorId:reviewerId,
            action:outcome.action,
            targetType:"product",
            targetId:productId,
            reason:input.note,
            ipAddress:ip,
            metadata:{
               decision:input.decision,
               from:"in_review",
               to:outcome.status
            }
         }
      })
      return tx.product.findUnique({where:{id:productId}});
   })
 }