import { Router } from "express";
import * as auth from "../controllers/auth.controller";

const router = Router();

router.post("/signup", auth.signUp);
// router.post("/login", auth.login);
// router.post("/logout", auth.logout);
// router.post("/refresh-token", auth.refresh);
// router.post("/forgot-password", auth.forgotPassword);
// router.post("/reset-password", auth.resetPassword);

 router.get("/verify-email", auth.verifyEmail);
 router.post("/resend-verification", auth.resendVerification);
// router.get("/me", requireAuth, auth.me);

export default router;