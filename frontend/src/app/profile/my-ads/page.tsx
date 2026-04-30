"use client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { useSession } from "next-auth/react";
import ListingCard from "@/components/ListingCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

// 1. IMPORT TOAST AND CONFIRM MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function MyAdsPage() {
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. MODAL STATE FOR DELETING ADS
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAds = async () => {
      setIsLoading(true);
      try {
        const localToken = localStorage.getItem("token");
        const headers: HeadersInit = {};

        if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
        else if (session?.user?.email) headers["x-google-email"] = session.user.email;

        // FETCH FROM THE NEW PRIVATE DASHBOARD ROUTE
        const response = await fetch("http://localhost:5000/api/listings/my-listings", {
          method: "GET",
          headers: headers,
        });
        
        const result = await response.json();
        if (result.success) {
          setMyListings(result.data);
        }
      } catch (error) {
        console.error("Error fetching my ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyAds();
  }, [session]);

  // 3. SPLIT DELETE FUNCTION: Step A - Open Modal
  const confirmDelete = (listingId: string) => {
    setListingToDelete(listingId);
    setIsDeleteModalOpen(true);
  };

  // 3. SPLIT DELETE FUNCTION: Step B - Execute Deletion
  const executeDelete = async () => {
    if (!listingToDelete) return;

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };

      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      const response = await fetch(`http://localhost:5000/api/listings/${listingToDelete}`, {
        method: "DELETE",
        headers: headers,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMyListings((prevListings) => prevListings.filter((ad) => ad._id !== listingToDelete));
        toast.success("Ad deleted successfully!"); // Replaced alert
      } else {
        toast.error(result.message || "Failed to delete ad."); // Replaced alert
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("An error occurred while deleting the ad."); // Replaced alert
    } finally {
      setListingToDelete(null); // Clean up state
    }
  };

  // THE FIX: Force the page to always open at the very top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const displayListings = myListings.filter((ad) => ad.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // SPLIT LISTINGS BY STATUS
  const activeAds = displayListings.filter(ad => ad.status === "active");
  const pendingAds = displayListings.filter(ad => ad.status !== "active");
  
  const currentTabListings = activeFilter === "active" ? activeAds : pendingAds;

  const tabButtonBase = "border rounded-[20px] py-2 px-[15px] text-sm font-semibold cursor-pointer transition-all duration-200";
  const tabButtonActive = "bg-[#007bff] text-white border-[#007bff] hover:bg-[#0056b3] shadow-md";
  const tabButtonInactive = "bg-white text-[#002f34] border-[#ddd] hover:bg-[#f0f0f0]";

  return (
    <ProtectedRoute>
     <div className="max-w-[1200px] mx-auto py-10 px-5 min-h-screen pt-[80px] md:pt-[30px] pb-24 md:pb-10">
        <div className="border-b border-[#eee] pb-[20px] md:pb-[25px] mb-[20px] md:mb-[30px]">
          <h1 className="text-[24px] md:text-[32px] font-bold text-[#002f34] mb-[20px] md:mb-[25px] leading-tight">Manage and view your Ads</h1>

          <div className="flex items-center max-w-[500px] mb-5 border border-[#ddd] rounded-md bg-white transition-all duration-200 hover:border-[#007bff] ">
            <FiSearch size={22} className="ml-[15px] text-black" />
            <input
              type="text"
              placeholder="Search your ads by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow py-[10px] px-[15px] border-none outline-none text-[15px] text-[#333] bg-transparent"
            />
          </div>

          {/* Changed to flex-row for BOTH mobile and desktop, with flex-1 so they sit side-by-side! */}
          <div className="flex flex-row gap-2 sm:gap-[15px]">
            <button
              onClick={() => setActiveFilter("active")}
              className={`flex-1 sm:flex-none text-[12px] sm:text-sm px-1 sm:px-[15px] ${tabButtonBase} ${activeFilter === "active" ? tabButtonActive : tabButtonInactive}`}
            >
              Active ({activeAds.length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`flex-1 sm:flex-none text-[12px] sm:text-sm px-1 sm:px-[15px] flex items-center justify-center sm:justify-start gap-1 ${tabButtonBase} ${activeFilter === "pending" ? tabButtonActive : tabButtonInactive}`}
            >
              {pendingAds.length > 0 && <FiAlertCircle size={14} className={activeFilter === "pending" ? "text-white" : "text-red-500"} />}
              <span>Pending <span className="hidden sm:inline">/ Action</span> ({pendingAds.length})</span>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-[18px] font-bold mb-5 text-[#002f34]">
            {activeFilter === "active" ? "Your Active Listings" : "Ads Pending Approval or Missing Images"}
          </h3>

          {isLoading ? (
            <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading your ads...</div>
          ) : currentTabListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentTabListings.map((item) => (
                <div key={item._id} className="relative group flex flex-col">
                  
                  {activeFilter === "pending" ? (
                     <div className="relative border border-orange-300 rounded-md overflow-hidden bg-orange-50/30 p-4 flex flex-col items-center justify-center text-center h-full">
                       <FiAlertCircle size={40} className="text-orange-500 mb-3" />
                       <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                       <p className="text-xs text-gray-600 mb-4">This ad is inactive. It may be missing images or waiting for AI approval.</p>
                       <Link href={`/edit-listing/${item._id}`} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full transition-colors block text-center">
                         Edit Ad to Fix
                       </Link>
                     </div>
                  ) : (
                    <ListingCard data={item} />
                  )}

                  <button
                    onClick={() => confirmDelete(item._id)}
                    className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-500 text-red-600 font-semibold rounded-md transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <FiTrash2 size={18} /> Delete Ad
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded border border-gray-200">
              <FiFilter className="mx-auto text-4xl text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No {activeFilter} ads found</h3>
              <p className="text-gray-500 mt-2">
                {activeFilter === "active" 
                  ? "You haven't posted any active ads yet, or none match your search." 
                  : "Great job! All of your ads are active and visible to the public."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. OUR NEW DELETE CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Ad"
        message="Are you sure you want to permanently delete this ad? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true} // Makes the button red!
      />

    </ProtectedRoute>
  );
}