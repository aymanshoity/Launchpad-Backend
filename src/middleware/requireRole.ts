import { NextFunction, Request, RequestHandler,Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";



type Role="admin" | "member" | "reviewer";

export const requireRole = (...allowed: Role[]): RequestHandler => {
return async (_req:Request, res:Response, next:NextFunction) => {
   const user=await prisma.user.findUnique({
      where:{id:res.locals.userId},
      select:{role:true,status:true,deletedAt:true}
   })
   
   if (!user||user.deletedAt ||user.status!=="active" || !allowed.includes(user.role)) {
      throw new AppError(403, "You don't have permission to do this");
   }
   res.locals.role=user.role;
   next();
}
}