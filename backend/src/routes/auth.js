import express from "express";

import {
  signup,
  login,
  googleLogin,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/verify-email", verifyEmailController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;
