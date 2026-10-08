import crypto from "crypto";
import jwt,{JwtPayload} from "jsonwebtoken";
import {env} from "../config/env";

export const ACCESS_TTL_SECONDS=15*60;
export const REFRESH_TTL_SECONDS=7*60*60*24;

export const signAccessToken=(userId:string,role:string)=>{
   return jwt.sign({role},env.JWT_ACCESS_SECRET,{
      subject:userId,
      expiresIn:ACCESS_TTL_SECONDS
   })
}
export const verifyAccessToken=(token:string)=>{
  const payload=jwt.verify(token,env.JWT_ACCESS_SECRET) as JwtPayload;
  return {userId:payload.sub,role:payload.role as string}
}

export const signRefreshToken=(userId:string)=>{
   return jwt.sign({},env.JWT_REFRESH_SECRET,{
      subject:userId,
      expiresIn:REFRESH_TTL_SECONDS,
      jwtid:crypto.randomUUID()
   })
}

export const verifyRefreshToken=(token:string)=>{
  const payload=jwt.verify(token,env.JWT_REFRESH_SECRET) as JwtPayload;
  return {userId:payload.sub as string}
}
export const hashToken=(token:string)=>{
  return crypto.createHash("sha256").update(token).digest("hex")
}
export const generateRandomToken=()=>{
  return crypto.randomBytes(32).toString("hex")
}

