import User from "../models/user.js";
import Listing from "../models/listing.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import Notification from "../models/notification.js";
import Report from "../models/report.js";
import Subscription from "../models/subscription.js";
import bcrypt from "bcrypt";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updateData = {
      name,
      phone,
    };

    // ✅ FIXED IMAGE PATH
    // If user uploads new image
    if (req.file) {
      updateData.profilePhotoPath = `/uploads/profiles/${req.file.filename}`;
    } else if (req.body.removePhoto === "true") {
      updateData.profilePhotoPath = "";
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Change password (email users only)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.loginProvider && user.loginProvider !== "email") {
      return res
        .status(403)
        .json({ message: "Google users cannot change password" });
    }

    // Check if password exists
    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ message: "No password set for this account" });
    }

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedPassword; // <-- update the correct field
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ACCOUNT (NO PASSWORD REQUIRED)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 DELETE ALL RELATED DATA

    await Listing.deleteMany({ lenderId: user._id });

    await Conversation.deleteMany({
      participants: user._id,
    });

    await Message.deleteMany({
      sender: user._id,
    });

    await Notification.deleteMany({
      user: user._id,
    });

    await Report.deleteMany({
      user: user._id,
    });

    await Subscription.deleteMany({
      user: user._id,
    });

    // ❌ KEEP payments (as per your decision)

    // 🧨 DELETE USER
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      message: "Account and all related data deleted successfully",
    });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
