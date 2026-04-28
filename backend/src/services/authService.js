import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import crypto from "crypto";
import transporter from "../utils/nodemailer.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email signup
export const signupUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already registered");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    passwordHash,
    verificationToken,
  });
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: `"Rentza" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
    <h2>Welcome to Rentza</h2>
    <p>Please verify your email:</p>
    <a href="${verifyUrl}">Verify Email</a>
  `,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return {
    message: "Signup successful. Please verify your email.",
  };
};

// Email login
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid credentials");

  if (!user.emailVerified) {
    throw new Error("Please verify your email first");
  }
  if (!user.isActive) {
    throw new Error(
      "Your account is suspended, contact the admin for more justification.",
    );
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token, user };
};

// Google login
export const googleLoginUser = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      emailVerified: true,
      profilePhotoPath: picture,
    });
  }
  if (!user.isActive) {
    throw { status: 403, message: "Your account is suspended" };
  }

  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { token: jwtToken, user };
};

export const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    throw new Error("Invalid verification token");
  }

  user.emailVerified = true;
  user.verificationToken = null;

  await user.save();

  return { message: "Email verified successfully" };
};

// 1️⃣ Forgot Password Service
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found with this email");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = Date.now() + 3600 * 1000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Rentza" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset Password Request</h2>
      <p>Click the link below to reset your password. The link is valid for 1 hour.</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  });

  return { message: "Password reset link sent to your email" };
};

// 2️⃣ Reset Password Service
export const resetPasswordService = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // token not expired
  });

  if (!user) throw new Error("Invalid or expired reset token");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  user.passwordHash = passwordHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return { message: "Password has been reset successfully" };
};
