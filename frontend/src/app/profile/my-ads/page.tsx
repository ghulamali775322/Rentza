"use client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiTrash2 } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import ListingCard from "@/components/ListingCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyAdsPage() {
  const { data: session } = useSession();
  const { name } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyAds = async () => {
      setIsLoading(true);
      try {
        const localToken = localStorage.getItem("token");
        let mongoUserId = null;

        // 1. Crack open the JWT token to get the exact MongoDB _id for your backend route!
        if (localToken) {
          try {
            const payload = JSON.parse(atob(localToken.split(".")[1]));
            mongoUserId = payload.id;
          } catch (e) {
            console.error("Could not parse token");
          }
        }

        // 2. If we found the ID (Email Login), use your awesome backend route!
        if (mongoUserId) {
          const response = await fetch(
            `http://localhost:5000/api/listings/lender/${mongoUserId}`,
          );
          const result = await response.json();
          if (result.success) {
            setMyListings(result.data);
          }
        }
        // 3. If Google Login (no Mongo ID on frontend), fallback to fetching all and filtering by name
        else if (session?.user?.name) {
          const response = await fetch("http://localhost:5000/api/listings");
          const result = await response.json();
          if (result.success) {
            const googleUserAds = result.data.filter(
              (item: any) => item.lenderId?.name === session?.user?.name,
            );
            setMyListings(googleUserAds);
          }
        }
      } catch (error) {
        console.error("Error fetching my ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyAds();
  }, [session]);

  // --- THE DELETE FUNCTION ---
  const handleDelete = async (listingId: string) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this ad?")
    ) {
      return;
    }

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (localToken) {
        headers["Authorization"] = `Bearer ${localToken}`;
      } else if (session?.user?.email) {
        headers["x-google-email"] = session.user.email;
      }

      // Ping your backend DELETE route
      const response = await fetch(
        `http://localhost:5000/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: headers,
          credentials: "include",
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Instantly remove it from the screen without reloading the page
        setMyListings((prevListings) =>
          prevListings.filter((ad) => ad._id !== listingId),
        );
        alert("Ad deleted successfully!");
      } else {
        alert(result.message || "Failed to delete ad.");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("An error occurred while deleting the ad.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const displayListings = myListings.filter((ad) =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const tabButtonBase =
    "border rounded-[20px] py-2 px-[15px] text-sm font-semibold cursor-pointer transition-all duration-200";
  const tabButtonActive =
    "bg-[#007bff] text-white border-[#007bff] hover:bg-[#0056b3]";
  const tabButtonInactive =
    "bg-white text-[#002f34] border-[#ddd] hover:bg-[#f0f0f0]";

  return (
    <ProtectedRoute>
      <div className="max-w-[1200px] mx-auto py-10 px-5 min-h-screen pt-[30px]">
        <div className="border-b border-[#eee] pb-[25px] mb-[30px]">
          <div className="text-[15px] text-[#888] no-underline mb-[5px] block">
            Profile
          </div>

          <h1 className="text-[32px] font-bold text-[#002f34] mb-[25px]">
            Manage and view your Ads
          </h1>

          <div className="flex items-center max-w-[500px] mb-5 border border-[#ddd] rounded-md bg-white transition-all duration-200 hover:border-[#007bff] ">
            <FiSearch size={22} className="ml-[15px] text-black" />
            <input
              type="text"
              placeholder="Search your ads by title"
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow py-[10px] px-[15px] border-none outline-none text-[15px] text-[#333] bg-transparent"
            />
          </div>

          <div className="flex gap-[15px] flex-wrap">
            <button
              onClick={() => setActiveFilter("active")}
              className={`${tabButtonBase} ${activeFilter === "active" ? tabButtonActive : tabButtonInactive}`}
            >
              Active Ads ({myListings.length})
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-[18px] font-bold mb-5 text-[#002f34]">
            Your Active Listings
          </h3>

          {isLoading ? (
            <div className="text-center py-20 text-gray-500 font-bold animate-pulse">
              Loading your ads...
            </div>
          ) : displayListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayListings.map((item) => (
                <div key={item._id} className="relative group flex flex-col">
                  <ListingCard data={item} />

                  {/* The Delete Button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-500 text-red-600 font-semibold rounded-md transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <FiTrash2 size={18} />
                    Delete Ad
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded border border-gray-200">
              <FiFilter className="mx-auto text-4xl text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No ads found</h3>
              <p className="text-gray-500 mt-2">
                You haven't posted any ads yet, or none match your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
