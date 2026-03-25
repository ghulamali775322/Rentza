import {
  signupUser,
  loginUser,
  googleLoginUser,
} from "../services/authService.js";
import { verifyEmail } from "../services/authService.js";
import {
  forgotPasswordService,
  resetPasswordService,
} from "../services/authService.js";

import User from "../models/user.js";

export const signup = async (req, res) => {
  try {
    const result = await signupUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    // NEW: Update lastActive time
    const userId = result?.user?._id || result?.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActive: new Date() });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const result = await googleLoginUser(token); // ✅ call correct function
    // NEW: Update lastActive time
    const userId = result?.user?._id || result?.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActive: new Date() });
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    const result = await verifyEmail(token);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 1️⃣ Forgot Password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2️⃣ Reset Password
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordService(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
