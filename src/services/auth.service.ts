
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { User } from "../../generated/prisma/client";
import { signRefreshToken ,hashToken,REFRESH_TTL_SECONDS,signAccessToken, generateRandomToken} from "../utils/tokens";
import { env } from "../config/env";
import { sendSignupVerificationEmail,sendPasswordResetEmail } from "../utils/mailer";
import { AppError } from "../utils/AppError";
const BCRYPT_ROUNDS = 12

const DUMMY_HASH = bcrypt.hashSync('dummy', BCRYPT_ROUNDS)
type ClientInfo = {
   ip?: string
   userAgent?: string 
}

export const toPublicUser=(user:User)=>{
return {
         id:user?.id,
         email:user?.email,
         username:user?.username,
         displayName:user?.displayName,
         role:user?.role,
         emailVerified:user?.emailVerifiedAt
      }

}
export const startSession=async(user:User,client:ClientInfo)=>{

   const refreshToken=signRefreshToken(user?.id)
   await prisma.session.create({
      data:{
         userId:user?.id,
         refreshTokenHash:hashToken(refreshToken),
         userAgent:client.userAgent ?? "",
         ip:client.ip,
         expiresAt:new Date(Date.now()+REFRESH_TTL_SECONDS*1000)
      }
   })
return {accessToken:signAccessToken(user.id,user.role),refreshToken}
}
export const signup = async (input: { username: string, email: string, password: string }, client: ClientInfo) => {
   const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
   const user= await prisma.user.create({
      data: {
         email: input.email,
         passwordHash: passwordHash,
         displayName: input.username,
         username: input.username,
         signupIp:client.ip
      }
   })
   const token=generateRandomToken()
   await  prisma.authToken.create({
      data:{
         userId:user.id,
         purpose:"verify_email",
         tokenHash:hashToken(token),
         expiresAt:new Date(Date.now()+ 24*60*60*1000)
      }
   })
   await sendSignupVerificationEmail(user.email,`${env.APP_URL}/verify-email?token=${token}`)
   return {user};
}

export const verifySignupEmail=async(token:string)=>{
const record=await prisma.authToken.findUnique({
   where:{tokenHash:hashToken(token)}
})

if(!record || record.purpose !=="verify_email" || record.expiresAt <new Date()){
   throw new AppError(400,"Verification link is invalid or has expired")
}

await prisma.$transaction([
   prisma.user.update({
      where:{id:record.userId},
      data:{emailVerifiedAt:new Date()}
   }),
   prisma.authToken.update({
      where:{id:record.id},
      data:{usedAt:new Date()}
   })
])
}
export const resendVerificationEmail=async(email:string)=>{
const user=await prisma.user.findUnique({where:{email}})
if(!user ||user.deletedAt || user.emailVerifiedAt){
   throw new AppError(400,"User not found or already verified")
}
const token = generateRandomToken();
await prisma.$transaction([
   prisma.authToken.deleteMany({
      where:{userId:user.id,purpose:"verify_email",usedAt:null}
   }),
   prisma.authToken.create({
      data:{
         userId:user.id,
         purpose:"verify_email",
         tokenHash:hashToken(token),
         expiresAt:new Date(Date.now()+ 24*60*60*1000)
      }
   })
])

await sendSignupVerificationEmail(user.email,`${env.APP_URL}/verify-email?token=${token}`)
}

