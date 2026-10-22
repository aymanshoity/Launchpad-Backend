
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { User } from "../../generated/prisma/client";
import { signRefreshToken, hashToken, REFRESH_TTL_SECONDS, signAccessToken, generateRandomToken, verifyRefreshToken } from "../utils/tokens";
import { env } from "../config/env";
import { sendSignupVerificationEmail, sendPasswordResetEmail } from "../utils/mailer";
import { AppError } from "../utils/AppError";
import { OAuth2Client } from "google-auth-library";
const BCRYPT_ROUNDS = 12

const DUMMY_HASH = bcrypt.hashSync('dummy', BCRYPT_ROUNDS)
type ClientInfo = {
   ip?: string
   userAgent?: string
}

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

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
         headline: "",
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
   await sendSignupVerificationEmail(user.email, `${env.FRONTEND_URL}/verify-email?token=${token}`)
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

   await sendSignupVerificationEmail(user.email, `${env.FRONTEND_URL}/verify-email?token=${token}`)
}

export const loginUser = async (email: string, password: string, client: ClientInfo) => {

   const user = await prisma.user.findUnique({ where: { email } })

   const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

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

export const loginWithGoogle = async (idToken: string, client: ClientInfo) => {

   const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID
   })

   const payload = ticket.getPayload()

   if (!payload?.sub || !payload.email) {
      throw new AppError(401, "Invalid Google Token")
   }

   const existingIdentity = await prisma.oAuthAccount.findFirst({
      where: {
         provider: "google",
         providerUserId: payload.sub
      },
      include: { user: true }
   })

   let user = existingIdentity?.user

   if (user) {
      await prisma.oAuthAccount.create({
         data: { userId: user.id, provider: "google", email: payload.email, providerUserId: payload.sub },
      })
   } else {
      const baseUsername = payload.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_")
      let username = baseUsername;
      let suffix = 0;
      while (await prisma.user.findFirst({ where: { username } })) {
         suffix += 1;
         username = `${baseUsername}_${suffix}`;
      }
      user = await prisma.user.create({
         data: {
            email: payload.email,
            username,
            headline: "",
            displayName: payload.name ?? payload.email.split("@")[0],
            avatarURL: payload?.picture,
            emailVerifiedAt: new Date(),
            passwordHash: null,
            oauthAccounts: {
               create: { provider: "google", email: payload.email, providerUserId: payload.sub }
            }

         }
      })

      if (user.deletedAt) {
         throw new AppError(403, "This account is no longer available");
      }
      if (user.status === "suspended") {
         throw new AppError(403, "This account is suspended");
      }

      return {user,...await(startSession(user,client))}

   }
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
   await sendPasswordResetEmail(user.email, `${env.FRONTEND_URL}/reset-password?token=${token}`)
}

export const resetPasswordService = async (token: string, newPassword: string) => {
   const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } })
   if (!record || record.purpose !== "reset_password" || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "Reset link is invalid or has expired")
   }

   const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
   const now = new Date();
   await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash, passwordChangedAt: now, failedAttempts: 0, lockedUntil: null } }),
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

export const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string) => {

   const user = await prisma.user.findUnique({ where: { id: userId } })

   if (!user || user.deletedAt || !user.passwordHash) {
      throw new AppError(400, "Password change is not available for this account");
   }

   const currentOk = await bcrypt.compare(currentPassword, user.passwordHash)
   if (!currentOk) {
      throw new AppError(401, "Current password is incorrect")
   }

   const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

   await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
   })
}