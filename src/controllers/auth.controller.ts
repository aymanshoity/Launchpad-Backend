
import { Request, RequestHandler } from "express"
import {z} from "zod"
import { signup, toPublicUser ,verifySignupEmail,resendVerificationEmail} from "../services/auth.service"
import { setRefreshCookie } from "../utils/cookies"

const email =z.string().trim().toLowerCase().email()
const password =z.string().min(8).max(80).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,{message:"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"})

const signUpSchema=z.object({
   username:z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9_]+$/,{message:"Username can only contain letters, numbers and underscores"}) ,
   email,
   password
})
const verifyEmailSchema=z.object({token:z.string().min(1)})
const resendSchema=z.object({email})

const loginSchema=z.object({email,password:z.string().min(8).max(80)})
const forgetSchema=z.object({email})
const resetSchema=z.object({token:z.string().min(1),password})
const clientInfo=(req:Request)=>({
ip:req.ip,userAgent:req.get("user-agent")
})
export const signUp:RequestHandler=async(req,res)=>{
const body=signUpSchema.parse(req.body)
const {user}=await signup(body,clientInfo(req))
res.status(201).json({user:toPublicUser(user),message:"Account created. Check your email to verify before logging in."})
}

export const verifyEmail:RequestHandler=async(req,res)=>{
  const {token}=verifyEmailSchema.parse(req.query)
  await verifySignupEmail(token)
   res.status(200).json({message:"Email verified successfully. You can now log in."})
}
export const resendVerification:RequestHandler=async(req,res)=>{
 const {email}=resendSchema.parse(req.body)
  await resendVerificationEmail(email)
   res.status(200).json({message:"Verification email sent. Check your inbox."})
}