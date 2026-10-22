import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { requiredAuth } from "../middleware/requireAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/signup", auth.signUp);
router.post("/login", auth.login);
router.post("/google-login", auth.googleLogin);
router.post("/logout", auth.logout);
router.post("/refresh-token", auth.refresh);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.post("/change-password",requiredAuth, auth.changePassword);

 router.get("/verify-email", auth.verifyEmail);
 router.post("/resend-verification", auth.resendVerification);
router.get("/me", requiredAuth, auth.me);
router.patch("/update-profile", requiredAuth, upload.single("avatar"),auth.updateProfile);

export default router;