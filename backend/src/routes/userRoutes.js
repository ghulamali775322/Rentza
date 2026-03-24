import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";
import { protect as authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Get profile
router.get("/profile", authMiddleware, getProfile);
// Change password (email users only)
router.put("/password", authMiddleware, changePassword);

router.delete("/", authMiddleware, deleteAccount);

// Update profile (with image)
router.put(
  "/profile",
  authMiddleware,
  upload.single("profilePhoto"), // 👈 IMPORTANT
  updateProfile,
);

export default router;
