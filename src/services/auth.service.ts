
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { User } from "../../generated/prisma/client";
import { signRefreshToken, hashToken, REFRESH_TTL_SECONDS, signAccessToken, generateRandomToken, verifyRefreshToken } from "../utils/tokens";
import { env } from "../config/env";
import { sendSignupVerificationEmail, sendPasswordResetEmail } from "../utils/mailer";
import { AppError } from "../utils/AppError";
const BCRYPT_ROUNDS = 12

const DUMMY_HASH = bcrypt.hashSync('dummy', BCRYPT_ROUNDS)
type ClientInfo = {
   ip?: string
   userAgent?: string
}

export const toPublicUser = (user: User) => {
   return {
      id: user?.id,
      email: user?.email,
      username: user?.username,
      displayName: user?.displayName,
      role: user?.role,
      emailVerified: user?.emailVerifiedAt
   }

}
export const startSession = async (user: User, client: ClientInfo) => {

   const refreshToken = signRefreshToken(user?.id)
   await prisma.session.create({
      data: {
         userId: user?.id,
         refreshTokenHash: hashToken(refreshToken),
         userAgent: client.userAgent ?? "",
         ip: client.ip,
         expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
      }
   })
   return { accessToken: signAccessToken(user.id, user.role), refreshToken }
}
export const signup = async (input: { username: string, email: string, password: string }, client: ClientInfo) => {
   const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
   const user = await prisma.user.create({
      data: {
         email: input.email,
         passwordHash: passwordHash,
         displayName: input.username,
         username: input.username,
         signupIp: client.ip
      }
   })
   const token = generateRandomToken()
   await prisma.authToken.create({
      data: {
         userId: user.id,
         purpose: "verify_email",
         tokenHash: hashToken(token),
         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
   })
   await sendSignupVerificationEmail(user.email, `${env.APP_URL}/verify-email?token=${token}`)
   return { user };
}

export const verifySignupEmail = async (token: string) => {
   const record = await prisma.authToken.findUnique({
      where: { tokenHash: hashToken(token) }
   })

   if (!record || record.purpose !== "verify_email" || record.expiresAt < new Date()) {
      throw new AppError(400, "Verification link is invalid or has expired")
   }

   await prisma.$transaction([
      prisma.user.update({
         where: { id: record.userId },
         data: { emailVerifiedAt: new Date() }
      }),
      prisma.authToken.update({
         where: { id: record.id },
         data: { usedAt: new Date() }
      })
   ])
}
export const resendVerificationEmail = async (email: string) => {
   const user = await prisma.user.findUnique({ where: { email } })
   if (!user || user.deletedAt || user.emailVerifiedAt) {
      throw new AppError(400, "User not found or already verified")
   }
   const token = generateRandomToken();
   await prisma.$transaction([
      prisma.authToken.deleteMany({
         where: { userId: user.id, purpose: "verify_email", usedAt: null }
      }),
      prisma.authToken.create({
         data: {
            userId: user.id,
            purpose: "verify_email",
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
         }
      })
   ])

   await sendSignupVerificationEmail(user.email, `${env.APP_URL}/verify-email?token=${token}`)
}

export const loginUser = async (email: string, password: string, client: ClientInfo) => {

   const user = await prisma.user.findUnique({ where: { email } })

   const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH) ? user?.passwordHash : DUMMY_HASH

   if (!user || user.deletedAt || !passwordOk || !user.passwordHash) {
      throw new AppError(401, "Invalid email or password")
   }
   if (user.status === "suspended") {
      throw new AppError(403, "Account is suspended")
   }
   if (!user.emailVerifiedAt) {
      throw new AppError(403, "Please verify your email before logging in");
   }

   return { user, ...(await startSession(user, client)) }
}

export const refreshSession = async (refreshToken: string) => {
   const { userId } = verifyRefreshToken(refreshToken)

   const session = await prisma.session.findFirst({
      where: { refreshTokenHash: hashToken(refreshToken) }
   })

   if (!session) {
      await prisma.session.updateMany({
         where: { userId },
         data: { revokedAt: new Date() }
      })
      throw new AppError(401, "Invalid refresh Token")
   }
   if (session.expiresAt < new Date() || session.revokedAt) {
      throw new AppError(401, "Session expired, please log in again");
   }

   const user = await prisma.user.findUnique({ where: { id: session.userId } })
   if (!user || user.deletedAt || user.status !== "active" || !user.emailVerifiedAt) {
      throw new AppError(401, "Account unavailable");
   }
   const newRefreshToken = signRefreshToken(user.id);
   await prisma.session.update({
      where: { id: session.id },
      data: {
         refreshTokenHash: hashToken(newRefreshToken),
         lastUsedAt: new Date(),
         expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
      }
   })
   return { user, accessToken: signAccessToken(user.id, user.role), refreshToken: newRefreshToken }

}

export const logoutUser = async (refreshToken: string) => {
   if (!refreshToken) return

   await prisma.session.updateMany({
      where: { refreshTokenHash: hashToken(refreshToken) },
      data: { revokedAt: new Date() },
   });
}

export const forgotPasswordService = async (email: string) => {
   const user = await prisma.user.findUnique({ where: { email } })

   if (!user || user.deletedAt || user.status !== "active") return;

   const token = generateRandomToken()
   await prisma.$transaction([
      prisma.authToken.deleteMany({
         where: { userId: user.id, purpose: "reset_password", usedAt: null }
      }),
      prisma.authToken.create({
         data: {
            userId: user.id,
            purpose: "reset_password",
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
         }
      })
   ])
   await sendPasswordResetEmail(user.email, `${env.APP_URL}/reset-password?token=${token}`)
}

export const resetPasswordService = async (token: string, newPassword: string) => {
   const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } })
   if (!record || record.purpose !== "reset_password" || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "Reset link is invalid or has expired")
   }

   const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
   const now = new Date();
   await prisma.$transaction([
      prisma.user.update({ where: { id: record.id }, data: { passwordHash } }),
      prisma.authToken.update({ where: { id: record.id }, data: { usedAt: now } }),
      prisma.session.updateMany({
         where: { userId: record.userId },
         data: { revokedAt: now }
      })
   ])

}

export const getUser = async (id: string) => {
   const user = await prisma.user.findUnique({ where: { id } })
   if (!user || user.deletedAt) throw new AppError(404, "User not Found")
   return user
}
