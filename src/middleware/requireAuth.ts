import { RequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/tokens";

export const requiredAuth:RequestHandler=async(req,res,next)=>{
   const header=req.headers.authorization;
   if(!header?.startsWith("Bearer ")){
      throw new AppError(401,"Missing Access Token")
   }

   const {userId ,role}=verifyAccessToken(header.slice("Bearer ".length))
   res.locals.userId=userId;
   res.locals.role=role;
   next()

}