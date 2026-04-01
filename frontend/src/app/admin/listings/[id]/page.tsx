"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { FiTrash2, FiClock, FiCheckCircle, FiX, FiEdit } from "react-icons/fi";
import {
  getListingDetails,
  deleteListing,
  updateListingStatus,
} from "@/app/api/admin/listings";

import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface Props {
  params: { id: string }; 
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ListingDetailsPage({ params }: Props) {
  const router = useRouter();
  const listingId = params.id;
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [actionLoading, setActionLoading] = useState(false);

  interface Listing {
    id: string;
    title: string;
    category: string;
    price: string;
    description: string;
    dateCreated: string;
    ownerName: string;
    ownerId: string;
    imageUrl: string;
    status: string;
    cloudReason?: string;
    pendingImages?: { id: number; src: string; status: "ok" | "flagged" }[];
  }

  // MODALS STATE
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // LISTING STATE
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const status = listing?.status?.toLowerCase();

  const handleDelete = async () => {
    if (!listing) return;

    try {
      setActionLoading(true);

      await deleteListing(listing.id);

      toast.success("Listing deleted successfully"); 
      router.push("/admin/listings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing"); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!listing) return;

    try {
      setActionLoading(true);

      await updateListingStatus(listing.id, newStatus);

      toast.success(`Listing ${newStatus} successfully`); 

      setListing((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status"); 
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await getListingDetails(listingId);
        if (res?.data?.success && res.data.data) {
          const apiData = res.data.data;

          const firstImage = apiData.images?.[0]?.url
            ? `${API_URL}${apiData.images[0].url}`
            : "";

          setListing({
            id: apiData._id,
            title: apiData.title,
            category: apiData.category,
            price: apiData.price.toString(),
            description: apiData.description,
            dateCreated: new Date(apiData.createdAt).toLocaleDateString(),
            ownerName: apiData.lenderId?.name || "Unknown",
            ownerId: apiData.lenderId?._id || "",
            imageUrl: firstImage,
            cloudReason: "",
            status: apiData.status,
            pendingImages:
              apiData.images?.map((img: any, idx: number) => ({
                id: idx,
                src: `${API_URL}${img.url}`,
                status: img.status || "ok",
              })) || [],
          });

          setSelectedImage(firstImage);
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500 text-lg">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-red-500 text-lg">
        Listing not found!
      </div>
    );
  }

  const isPending = status === "pending";
  const pendingImages = isPending ? listing.pendingImages || [] : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={reportId ? `/admin/reports/${reportId}` : "/admin/listings"}
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
        >
          <IoMdArrowBack size={28} />
        </Link>
        <h1 className="text-3xl font-bold text-[#002f34]">
          {isPending ? "Review Pending Listing" : "Listing Details"}
        </h1>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* IMAGE SECTION */}
          {isPending ? (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#8e1b1b] mb-2">
                  Cloud Vision Detection
                </h3>
                <p className="text-[#c53030] font-medium">
                  {listing.cloudReason}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-[#002f34] mb-4">
                  Listing Images
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pendingImages.map((img: any) => (
                    <div
                      key={img.id}
                      className={`relative rounded-lg overflow-hidden border-4 ${
                        img.status === "flagged"
                          ? "border-[#ff3547]"
                          : "border-[#00c851]"
                      } h-64`}
                    >
                      <img
                        src={img.src}
                        alt="Review"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded text-white text-xs font-bold uppercase ${
                          img.status === "flagged"
                            ? "bg-[#ff3547]"
                            : "bg-[#00c851]"
                        }`}
                      >
                        {img.status === "flagged" ? "Flagged" : "Ok"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
              {" "}
              <h2 className="text-lg font-bold text-[#002f34] mb-4">
                Listing Image
              </h2>
              <div className="w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-4">
                {" "}
                <div className="w-full">
                  {/* MAIN IMAGE */}
                  <div className="w-full h-[420px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shadow-sm">
                    {" "}
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Listing"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <span className="text-gray-400">No Image Available</span>
                    )}
                  </div>

                  {/* THUMBNAILS */}
                  <div className="flex gap-3 mt-5 flex-wrap">
                    {" "}
                    {listing.pendingImages?.map((img) => (
                      <img
                        key={img.id}
                        src={img.src}
                        onClick={() => setSelectedImage(img.src)}
                        className={`w-24 h-24 object-cover rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                          selectedImage === img.src
                            ? "border-[#0077ff] shadow-md"
                            : "border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LISTING & OWNER INFO */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <div className=" border-gray-100 p-8 space-y-8">
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#002f34]">
                    {listing.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Listing ID: {listing.id}
                  </p>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    status === "active"
                      ? "bg-green-100 text-green-600"
                      : status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status}
                </span>
              </div>

              {/* PRICE */}
              <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Price
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-semibold text-gray-600">
                      Rs.
                    </span>
                    <span className="text-3xl font-bold text-[#0077ff]">
                      {listing.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/day</span>
                  </div>
                </div>

                {/* Optional badge */}
                <div className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                  Rental
                </div>
              </div>
              {/* GRID INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Category</p>
                    <p className="font-medium text-[#002f34]">
                      {listing.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Upload Date
                    </p>
                    <p className="font-medium text-[#002f34]">
                      {listing.dateCreated}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Owner Name
                    </p>
                    <p className="font-medium text-[#002f34]">
                      {listing.ownerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">Owner ID</p>
                    <Link
                      href={`/admin/users/${listing.ownerId}`}
                      className="font-semibold text-[#0077ff] hover:underline"
                    >
                      {listing.ownerId}
                    </Link>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">
                  Description
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN - ACTIONS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            <div className="space-y-3">
              {status === "pending" && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#28a745] hover:bg-[#218838] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiCheckCircle size={20} /> Approve Listing
                  </button>
                  <button
                    onClick={() => setShowRemoveModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiTrash2 size={18} /> Delete Listing
                  </button>
                </>
              )}

              {status === "active" && (
                <>
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiEdit size={18} /> Edit Listing
                  </Link>
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff9800] hover:bg-[#e68a00] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiClock size={18} /> Suspend Listing
                  </button>
                  <button
                    onClick={() => setShowRemoveModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiTrash2 size={18} /> Delete Listing
                  </button>
                </>
              )}

              {status === "inactive" && (
                <>
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiEdit size={18} /> Edit Listing
                  </Link>
                  <button
                    onClick={() => setShowActivateModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#28a745] hover:bg-[#218838] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiCheckCircle size={20} /> Activate Listing
                  </button>
                  <button
                    onClick={() => setShowRemoveModal(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
                  >
                    <FiTrash2 size={18} /> Delete Listing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ConfirmModal 
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message={`Are you sure you want to delete listing "${listing.title}"?`}
        confirmText="Delete Listing"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmModal 
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={() => handleStatusChange("inactive")}
        title="Suspend Listing"
        message={`Are you sure you want to suspend listing "${listing.title}"?`}
        confirmText="Suspend Listing"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmModal 
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={() => handleStatusChange("active")}
        title="Activate Listing"
        message={`Are you sure you want to activate listing "${listing.title}"?`}
        confirmText="Activate Listing"
        cancelText="Cancel"
      />

      <ConfirmModal 
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={() => handleStatusChange("active")}
        title="Approve Listing"
        message={`Are you sure you want to approve listing "${listing.title}"?`}
        confirmText="Approve Listing"
        cancelText="Cancel"
      />

    </div>
  );
}