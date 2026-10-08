
import { CookieOptions ,Response} from "express";
import { env } from "../config/env";
import { REFRESH_TTL_SECONDS } from "./tokens";

export const REFRESH_COOKIE="refresh_token"
const baseOptions: CookieOptions = {
   httpOnly: true,
   secure: env.NODE_ENV === "production",
   sameSite: "lax",
   path: "/auth"
}

export const setRefreshCookie=(res:Response,token:string)=>{
 res.cookie(REFRESH_COOKIE,token,{
   ...baseOptions,
   maxAge:REFRESH_TTL_SECONDS*1000
 })
}
export const clearRefreshCookie=(res:Response)=>{
 res.clearCookie(REFRESH_COOKIE,baseOptions)
}
