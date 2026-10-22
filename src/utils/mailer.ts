import { env } from "../config/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});
export async function sendSignupVerificationEmail(to: string, link: string) {
  await transporter.sendMail({
   from:`"Launchpad" <${env.GMAIL_USER}>`,
   to,
   subject:"Verify Your Email",
   html:`<p>Click below to verify your email address. This link expires in 24 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  })
}
export async function sendPasswordResetEmail(to: string, link: string) {
  await transporter.sendMail({
   from:`"Launchpad" <${env.GMAIL_USER}>`,
   to,
   subject:"Reset Password",
   html:`<p>Click below to reset your password. This link expires in 24 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  })
}