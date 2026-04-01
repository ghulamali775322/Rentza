"use client";

import React, { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import {
  FiTrash2,
  FiCheckCircle,
  FiX,
  FiFileText,
  FiSlash,
  FiXCircle,
} from "react-icons/fi";
import {
  getReportDetails,
  updateReportStatus,
  executeReportAction,
  deleteReport,
} from "@/app/api/admin/reports";

// 1. IMPORT TOAST AND CONFIRM MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function ReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;

  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "Pending";
  
  // MODALS STATE
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showReviewLaterModal, setShowReviewLaterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendOwnerModal, setShowSuspendOwnerModal] = useState(false);
  const [showDeleteListingModal, setShowDeleteListingModal] = useState(false);

  // State to hold real report
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading state for actions
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Update report status
  const handleUpdateStatus = async (status: string) => {
    try {
      setActionLoading(true);
      await updateReportStatus(report.id, status);
      toast.success(`Report marked as ${status}`); // REPLACED ALERT
      // Refresh report data
      const res = await getReportDetails(reportId);
      setReport(transformReport(res.data.data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update report status"); // REPLACED ALERT
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Execute actions (like suspend owner, review later)
  const handleExecuteAction = async (actionType: string) => {
    try {
      setActionLoading(true);
      await executeReportAction(report.id, actionType);
      
      // Make the success message look nicer
      const actionName = actionType === "suspend_owner" ? "Owner suspended" : "Listing deleted";
      toast.success(`${actionName} successfully`); // REPLACED ALERT
      
      const res = await getReportDetails(reportId);
      setReport(transformReport(res.data.data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to execute action"); // REPLACED ALERT
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Delete report
  const handleDeleteReport = async () => {
    // REMOVED window.confirm (Modal handles this now)
    try {
      setActionLoading(true);
      await deleteReport(report.id);
      toast.success("Report deleted successfully"); // REPLACED ALERT
      router.push(`/admin/reports?tab=${tab}`); // Redirect to reports list
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete report"); // REPLACED ALERT
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to transform API response
  const transformReport = (reportData: any) => ({
    id: reportData._id,
    reason: reportData.reason,
    description: reportData.additionalComments,
    status: reportData.status,
    reportingUser: reportData.reporterId
      ? {
          name: reportData.reporterId.name,
          id: reportData.reporterId._id,
          email: reportData.reporterId.email,
          profilePhotoPath: reportData.reporterId.profilePhotoPath,
        }
      : null,
    reportedItem: reportData.reportedListingId
      ? {
          name: reportData.reportedListingId.title,
          id: reportData.reportedListingId._id,
          description: reportData.reportedListingId.description,
          category: reportData.reportedListingId.category,
          price: reportData.reportedListingId.price,
          status: reportData.reportedListingId.status,
          images: reportData.reportedListingId.images,
        }
      : null,
    reportedUser: reportData.reportedUserId
      ? {
          name: reportData.reportedUserId.name,
          id: reportData.reportedUserId._id,
          email: reportData.reportedUserId.email,
          phone: reportData.reportedUserId.phone,
          isActive: reportData.reportedUserId.isActive,
          totalReportsAgainstUser: reportData.totalReportsAgainstUser,
        }
      : null,
    date: new Date(reportData.createdAt).toLocaleDateString(),
    updatedAt: new Date(reportData.updatedAt).toLocaleDateString(),
  });

  React.useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await getReportDetails(reportId);

        // Transform API response to match frontend keys
        const reportData = res.data.data; // this is where actual report object is
        const transformedReport = transformReport(reportData);
        setReport(transformedReport); 
      } catch (err: any) {
        console.error(err);
        setError("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 text-center text-gray-500">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 text-center text-gray-500">
        Report not found.
      </div>
    );
  }
  const status = report.status.toLowerCase();
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push(`/admin/reports?tab=${tab}`)}
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
        >
          <IoMdArrowBack size={28} />
        </button>
        <h1 className="text-3xl font-bold text-[#002f34]">Report Details</h1>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* 🔷 REPORT OVERVIEW */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100 p-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4 md:gap-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#002f34]">
                  {report.reason}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Report ID: {report.id}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  report?.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : report?.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {report?.status
                  ? report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)
                  : "N/A"}
              </span>
            </div>

            <div className="border-t border-gray-100 mb-8"></div>

            {/* 🔹 INFO GRID (Updated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Date */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Report Date
                </p>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {report.date}
                </p>
              </div>

              {/* Reason */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Reason
                </p>
                <p className="mt-1 text-sm font-semibold text-[#002f34]">
                  {report.reason}
                </p>
              </div>
            </div>

            {/* 🔹 DESCRIPTION */}
            <div className="mt-8">
              <p className="text-xs text-gray-400 uppercase mb-2">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.description}
              </p>
            </div>
          </div>

          {/* 🔷 REPORTER INFO */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* PROFILE PHOTO */}
            {report.reportingUser?.profilePhotoPath ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${report.reportingUser.profilePhotoPath}`} // prepend API URL
                alt={report.reportingUser.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
                {report.reportingUser?.name?.charAt(0) || "U"}
              </div>
            )}

            {/* USER INFO */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-bold text-[#002f34] mb-2">
                Reported By
              </h3>

              <p className="text-sm font-semibold text-[#002f34]">
                {report.reportingUser?.name || "N/A"}
              </p>

              {report.reportingUser?.email && (
                <p className="text-xs text-gray-500">
                  {report.reportingUser.email}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                User ID:{" "}
                {report.reportingUser ? (
                  <Link
                    href={`/admin/users/${report.reportingUser.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {report.reportingUser.id}
                  </Link>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>

          {/* 🔷 REPORTED ITEM */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-[#002f34] mb-6">
              Reported Item
            </h3>

            <p className="mt-1 text-sm text-blue-600 hover:underline">
              {report.reportedItem ? (
                <Link
                  href={`/admin/listings/${report.reportedItem.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {report.reportedItem.name}
                </Link>
              ) : report.reportedUser ? (
                <Link
                  href={`/admin/users/${report.reportedUser.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {report.reportedUser.name}
                </Link>
              ) : (
                "N/A"
              )}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              ID:{" "}
              {report.reportedItem ? (
                <Link
                  href={`/admin/listings/${report.reportedItem.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {report.reportedItem.id}
                </Link>
              ) : report.reportedUser ? (
                <Link
                  href={`/admin/users/${report.reportedUser.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {report.reportedUser.id}
                </Link>
              ) : (
                "-"
              )}
            </p>
          </div>

          {/* 🔷 REPORTED USER */}
          {report.reportedUser && (
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-bold text-[#002f34] mb-6">
                Reported User
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* NAME */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#002f34]">
                    {report.reportedUser.name}
                  </p>
                </div>

                {/* EMAIL */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {report.reportedUser.email}
                  </p>
                </div>

                {/* PHONE */}
                {report.reportedUser.phone && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {report.reportedUser.phone}
                    </p>
                  </div>
                )}

                {/* USER ID */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    User ID
                  </p>
                  <p className="mt-1 text-sm text-blue-600 hover:underline">
                    <Link href={`/admin/users/${report.reportedUser.id}`}>
                      {report.reportedUser.id}
                    </Link>
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#002f34]">
                    <span
                      className={`${
                        report.reportedUser.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {report.reportedUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>

                {/* TOTAL REPORTS */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Total Reports
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {report.reportedUser.totalReportsAgainstUser || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN (ACTIONS) === */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>

            <div className="space-y-4">
              {status === "pending" && (
                <>
                  <button
                    onClick={() => setShowSuspendOwnerModal(true)} // WIRED UP
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiSlash size={20} /> Suspend Owner
                  </button>

                  <button
                    onClick={() => setShowReviewLaterModal(true)} // WIRED UP
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiFileText size={20} /> Review Later
                  </button>

                  <button
                    onClick={() => setShowDismissModal(true)} // WIRED UP
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#6c757d] hover:bg-[#5a6268] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiXCircle size={20} /> Dismiss Report
                  </button>

                  <button
                    onClick={() => setShowDeleteListingModal(true)} // WIRED UP
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiTrash2 size={20} /> Delete Listing
                  </button>
                </>
              )}

              {(status === "resolved" || status === "dismissed") && (
                <button
                  onClick={() => setShowDeleteModal(true)} // WIRED UP
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                >
                  <FiTrash2 size={20} /> Delete Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <ConfirmModal 
        isOpen={showSuspendOwnerModal}
        onClose={() => setShowSuspendOwnerModal(false)}
        onConfirm={() => {
          setShowSuspendOwnerModal(false);
          handleExecuteAction("suspend_owner");
        }}
        title="Suspend Owner"
        message="Are you sure you want to suspend this user? They will not be able to log in or post listings."
        confirmText="Suspend User"
        cancelText="Cancel"
        isDestructive={true} 
      />

      <ConfirmModal 
        isOpen={showReviewLaterModal}
        onClose={() => setShowReviewLaterModal(false)}
        onConfirm={() => {
          setShowReviewLaterModal(false);
          handleUpdateStatus("pending");
        }}
        title="Review Later"
        message="Are you sure you want to mark this report as pending to review it later?"
        confirmText="Mark Pending"
        cancelText="Cancel"
      />

      <ConfirmModal 
        isOpen={showDismissModal}
        onClose={() => setShowDismissModal(false)}
        onConfirm={() => {
          setShowDismissModal(false);
          handleUpdateStatus("dismissed");
        }}
        title="Dismiss Report"
        message="Are you sure you want to dismiss this report? No action will be taken."
        confirmText="Dismiss Report"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmModal 
        isOpen={showDeleteListingModal}
        onClose={() => setShowDeleteListingModal(false)}
        onConfirm={() => {
          setShowDeleteListingModal(false);
          handleExecuteAction("delete_listing");
        }}
        title="Delete Listing"
        message="Are you sure you want to permanently delete the reported listing?"
        confirmText="Delete Listing"
        cancelText="Cancel"
        isDestructive={true} 
      />

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDeleteReport();
        }}
        title="Delete Report"
        message="Are you sure you want to permanently delete this report? This action cannot be undone."
        confirmText="Delete Report"
        cancelText="Cancel"
        isDestructive={true} 
      />

    </div>
  );
}