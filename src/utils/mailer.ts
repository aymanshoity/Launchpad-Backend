import { env } from "../config/env";
import { Resend } from "resend";

const resend=new Resend(env.RESEND_API_KEY);
export async function sendSignupVerificationEmail(to: string, link: string) {
  await resend.emails.send({
   from:env.EMAIL_FROM,
   to,
   subject:"Verify Your Email",
   html:`<p>Click below to verify your email address. This link expires in 24 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  })
}
export async function sendPasswordResetEmail(to: string, link: string) {
  await resend.emails.send({
   from:env.EMAIL_FROM,
   to,
   subject:"Reset Password",
   html:`<p>Click below to reset your password. This link expires in 1 hour.</p>
           <p><a href="${link}">${link}</a></p>`
  })
}