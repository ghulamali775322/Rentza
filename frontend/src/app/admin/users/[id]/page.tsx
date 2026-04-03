"use client";

import React, { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { FiClock, FiX, FiTrash2, FiCheckCircle, FiList } from "react-icons/fi";
import {
  getUserDetails,
  updateUserStatus,
  deleteUser,
} from "@/app/api/admin/users";

// 1. IMPORT TOAST AND CONFIRM MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  emailVerified: boolean;
  joinedDate: string;
  totalListings: number;
  isActive: boolean;
}

export default function UserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const userType = searchParams.get("type");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusChange = async (newStatus: boolean) => {
    try {
      setActionLoading(true);

      await updateUserStatus(userId, newStatus);

      // ✅ Update UI instantly (no reload)
      setUser((prev) => (prev ? { ...prev, isActive: newStatus } : prev));
      
      toast.success(`User ${newStatus ? 'unsuspended' : 'suspended'} successfully`); // REPLACED ALERT

      // Close modals
      setShowSuspendModal(false);
      setShowUnsuspendModal(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update user status"); // REPLACED ALERT
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);

      await deleteUser(userId);

      toast.success("User deleted successfully"); // REPLACED ALERT

      // Redirect back to users list
      window.location.href = "/admin/users";
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete user"); // REPLACED ALERT
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getUserDetails(userId);

        if (!res.data || !res.data.data) {
          console.error("No user data returned from backend");
          setUser(null);
          return;
        }

        const u = res.data.data;

        setUser({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || "-",
          emailVerified: u.emailVerified,
          joinedDate: u.createdAt
            ? new Date(u.createdAt).toISOString().split("T")[0]
            : "-",
          totalListings:
            typeof u.totalListings === "number" ? u.totalListings : 0,
          isActive: u.isActive,
          profilePhoto: u.profilePhotoPath
            ? `${API_URL}${u.profilePhotoPath}`
            : "",
        });
        console.log("Fetched user:", u);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading)
    return <p className="p-6 text-gray-500">Loading user details...</p>;
  if (!user) return <p className="p-6 text-red-500">User not found</p>;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* --- HEADER ROW --- */}
      <div className="flex text-black items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[#002f34]">User Details</h1>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            {" "}
            {/* 🔷 HEADER / IDENTITY SECTION */}
            <div className="flex items-center gap-6 mb-8">
              <img
                src={user.profilePhoto || "/default-avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#002f34]">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>

                {/* 🔹 STATUS BADGES */}
                <div className="flex gap-3 mt-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.emailVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.emailVerified ? "Email Verified" : "Not Verified"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>
            </div>
            {/* 🔷 DIVIDER */}
            <div className="border-t border-gray-100 mb-8"></div>
            {/* 🔷 DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  User ID
                </label>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {user.id}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {user.phone || "-"}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Joined Date
                </label>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {user.joinedDate}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Total Listings
                </label>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {user.totalListings}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <p className="mt-1 text-sm font-semibold text-[#002f34] break-all">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* --- RIGHT COLUMN (Actions) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            <div className="space-y-4">
              {user.isActive ? (
                <>
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiClock size={20} /> Suspend User
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiTrash2 size={20} /> Delete User
                  </button>
                  <Link
                    href={`/admin/users/${userId}/listings`}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiList size={20} /> View User's Listings
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUnsuspendModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiCheckCircle size={20} /> Unsuspend User
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiTrash2 size={20} /> Delete User
                  </button>
                  <Link
                    href={`/admin/users/${userId}/listings`}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg font-bold transition-all shadow-sm"
                  >
                    <FiList size={20} /> View User's Listings
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* --- MODALS --- */}
      <ConfirmModal 
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={() => handleStatusChange(false)}
        title="Suspend User"
        message={`Are you sure you want to suspend ${user?.name}? They will not be able to access their account.`}
        confirmText="Suspend User"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmModal 
        isOpen={showUnsuspendModal}
        onClose={() => setShowUnsuspendModal(false)}
        onConfirm={() => handleStatusChange(true)}
        title="Unsuspend User"
        message={`Are you sure you want to restore access for ${user?.name}?`}
        confirmText="Unsuspend User"
        cancelText="Cancel"
      />

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${user?.name}? This action cannot be undone and deletes all their data.`}
        confirmText="Delete User"
        cancelText="Cancel"
        isDestructive={true}
      />

    </div>
  );
}