
import { Request, RequestHandler } from "express"
import { z } from "zod"
import { signup, toPublicUser, verifySignupEmail, resendVerificationEmail, loginUser, refreshSession, logoutUser,forgotPasswordService,resetPasswordService, getUser  } from "../services/auth.service"
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie,} from "../utils/cookies"
import { AppError } from "../utils/AppError"

const email = z.string().trim().toLowerCase().email()
const password = z.string().min(8).max(80).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character" })

const signUpSchema = z.object({
   username: z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers and underscores" }),
   email,
   password
})
const verifyEmailSchema = z.object({ token: z.string().min(1) })
const resendSchema = z.object({ email })

const loginSchema = z.object({ email, password: z.string().min(8).max(80) })
const forgetSchema = z.object({ email })
const resetSchema = z.object({ token: z.string().min(1), password })
const clientInfo = (req: Request) => ({
   ip: req.ip, userAgent: req.get("user-agent")
})
export const signUp: RequestHandler = async (req, res) => {
   const body = signUpSchema.parse(req.body)
   const { user } = await signup(body, clientInfo(req))
   res.status(201).json({ user: toPublicUser(user), message: "Account created. Check your email to verify before logging in.", status: 201 })
}

export const verifyEmail: RequestHandler = async (req, res) => {
   const { token } = verifyEmailSchema.parse(req.query)
   await verifySignupEmail(token)
   res.status(200).json({ message: "Email verified successfully. You can now log in.", status: 200 })
}
export const resendVerification: RequestHandler = async (req, res) => {
   const { email } = resendSchema.parse(req.body)
   await resendVerificationEmail(email)
   res.status(200).json({ message: "Verification email sent. Check your inbox.", status: 200 })
}

export const login: RequestHandler = async (req, res) => {
   const { email, password } = loginSchema.parse(req.body)
   const { accessToken, refreshToken } = await loginUser(email, password, clientInfo(req))
   setRefreshCookie(res, refreshToken)
   res.status(200).json({ accessToken, refreshToken, message: "Logged in successfully", status: 200 })
}

export const refresh: RequestHandler = async (req, res) => {
   const token = req.cookies?.[REFRESH_COOKIE];
   if (!token) throw new AppError(401, "No refresh Token provided")

   const { user, accessToken, refreshToken } = await refreshSession(token);
   setRefreshCookie(res, refreshToken);
   res.json({ accessToken, refreshToken, message: "Session refreshed successfully", status: 200 })
}

export const logout:RequestHandler=async(req,res)=>{
   await logoutUser(req.cookies?.[REFRESH_COOKIE]);
   clearRefreshCookie(res);
   res.status(200).json({ message: "Logged out successfully", status: 200 })

}

export const forgotPassword:RequestHandler=async(req,res)=>{
   const {email}=forgetSchema.parse(req.body)

   await forgotPasswordService(email)
   res.status(200).json({message:"If that email exists, a reset link has been sent.",status:200})
}

export const resetPassword:RequestHandler=async(req,res)=>{
   const {token,password}=resetSchema.parse(req.body)
   await resetPasswordService(token,password)
   clearRefreshCookie(res);
   res.status(200).json({message:"Password Updated,Please login Again",status:200})

}

export const me:RequestHandler=async(req,res)=>{
   const user =await getUser(res.locals.userId)
    res.status(200).json({user:toPublicUser(user),message:"Password Updated,Please login Again",status:200})
}