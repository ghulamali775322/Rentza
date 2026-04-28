"use client";

import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // For password toggle
import { FiAlertCircle, FiTrash2 } from "react-icons/fi"; // Icons for alert/delete confirmation
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

// 1. IMPORT TOAST AND CONFIRM MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const { data: session } = useSession(); // Google login

  const isEmailUser = !session?.user;
  const { setName, setProfilePhotoUrl } = useUser();

  const router = useRouter();
  // Password inputs
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Password validation
  const meetsMinLength = newPassword.length >= 8;
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const isNewPasswordValid =
    meetsMinLength && hasNumber && hasSpecialChar && hasLetter;
  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;

  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  
  // 2. MODAL STATE FOR DELETING ACCOUNT
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // Frontend validations
    if (!currentPassword)
      return setCurrentPasswordError("Current password is required");
    if (!newPassword) return setNewPasswordError("New password is required");
    if (!confirmPassword)
      return setConfirmPasswordError("Confirm password is required");
    if (!isNewPasswordValid)
      return setNewPasswordError("Password does not meet all requirements");
    if (!passwordsMatch)
      return setConfirmPasswordError("Passwords do not match");

    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // JWT for email users
      if (!token) throw new Error("You must be logged in");

      const res = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // send JWT
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Map backend errors to specific fields if possible
        if (data.message?.toLowerCase().includes("current")) {
          setCurrentPasswordError(data.message);
        } else if (data.message?.toLowerCase().includes("match")) {
          setConfirmPasswordError(data.message);
        } else if (data.message?.toLowerCase().includes("length")) {
          setNewPasswordError(data.message);
        } else {
          toast.error(data.message || "Failed to update password"); // REPLACED INLINE ERROR
        }
      } else {
        // Success
        toast.success(data.message || "Password updated successfully"); // REPLACED INLINE SUCCESS
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Server error"); // REPLACED INLINE ERROR
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      let headers: any = {
        "Content-Type": "application/json",
      };

      {
        // ✅ Email user → ONLY this
        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_URL}/api/user`, {
        method: "DELETE",
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      // ✅ SUCCESS → LOGOUT + REDIRECT
      toast.success("Account deleted successfully"); // REPLACED ALERT WITH TOAST

      // Email logout
      localStorage.removeItem("token");
      setName("");
      setProfilePhotoUrl("");

      // Google logout (NextAuth)
      if (session?.user) {
        await signOut({ redirect: false });
      }

      // Redirect
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account"); // REPLACED STATE ERROR
    }
  };

  // Tailwind classes
  const contentBoxClass =
    "bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[30px] p-[30px]";
  const sectionTitleClass = "text-2xl font-bold text-[#002f34] mb-[25px]";
  const inputBaseClass =
    "w-full py-3 px-[15px] border rounded text-base box-border mb-2.5 bg-white focus:outline-none focus:border-[#007bff]";
  const passwordToggleBtnClass =
    "absolute top-1/2 right-3 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] text-xl hover:text-[#007bff]";
  const errorMessageClass =
    "text-xs text-[#e30000] -mt-2 mb-[15px] flex items-center gap-[5px]";
  const passwordReqClass = "text-xs mb-[5px] flex items-center gap-[5px]";

  return (
    <div className="max-w-[900px] mx-auto px-5 py-10 bg-[#f5f5f5] min-h-[calc(100vh-80px)]">
      {/* ---------------- SECURITY SECTION ---------------- */}
      {isEmailUser && (
        <div className="bg-white text-black rounded-xl shadow-sm border border-[#eee] mb-8 p-6">
          <h2 className="text-xl font-semibold text-[#002f34] mb-2">
            Security
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handlePasswordChange}>
            {/* CURRENT PASSWORD */}
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-1">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full p-3 border rounded-md border-gray-300 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showCurrentPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-1">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setNewPasswordError("");
                  }}
                  autoComplete="new-password"
                  className={`w-full p-3 border rounded-md ${
                    newPasswordError ? "border-red-500" : "border-gray-300"
                  } [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showNewPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>

              {newPasswordError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {newPasswordError}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-1">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError("");
                  }}
                  autoComplete="new-password"
                  className={`w-full p-3 border rounded-md ${
                    confirmPasswordError ? "border-red-500" : "border-gray-300"
                  } [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
                  placeholder="Enter confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>

              {confirmPasswordError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {confirmPasswordError}
                </p>
              )}
            </div>

            {/* PASSWORD REQUIREMENTS */}
            {newPassword.length > 0 && (
              <div className="bg-gray-50 border rounded-md p-3 text-xs mb-4">
                <p
                  className={
                    meetsMinLength ? "text-green-600" : "text-gray-500"
                  }
                >
                  ✔ Minimum 8 characters
                </p>
                <p className={hasNumber ? "text-green-600" : "text-gray-500"}>
                  ✔ At least 1 number
                </p>
                <p
                  className={
                    hasSpecialChar ? "text-green-600" : "text-gray-500"
                  }
                >
                  ✔ At least 1 special character
                </p>
                <p className={hasLetter ? "text-green-600" : "text-gray-500"}>
                  ✔ At least 1 letter
                </p>
              </div>
            )}

            {currentPasswordError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FiAlertCircle size={12} /> {currentPasswordError}
              </p>
            )}

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading || !isNewPasswordValid || !passwordsMatch}
                className={`bg-[#002f34] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#004d55] disabled:bg-gray-400`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- DANGER ZONE ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Danger Zone</h2>

        <p className="text-sm text-gray-600 mb-4">
          Deleting your account is permanent. All your data will be removed.
        </p>

        <div className="border border-red-300 bg-red-50 p-4 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium text-red-700">Delete your account</p>
            <p className="text-xs text-red-600">
              This action cannot be undone.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 flex items-center gap-2"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* 4. OUR NEW DELETE CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true} 
      />

    </div>
  );
}