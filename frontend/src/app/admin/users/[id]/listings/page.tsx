"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { FiImage } from "react-icons/fi";

import { getUserListings, getUserDetails } from "@/app/api/admin/users";

// 1. IMPORT TOAST
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserListingsPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // 🔹 Fetch listings
        const resListings = await getUserListings(userId);
        setListings(resListings.data.data || []);

        // 🔹 Fetch user name
        const resUser = await getUserDetails(userId);
        setUserName(resUser.data?.data?.name || "User");
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        // 2. ADDED TOAST FOR API FAILURE
        toast.error("Failed to load user listings.");
        setListings([]);
        setUserName("User");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userId]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* --- HEADER ROW --- */}
      <div className="flex text-black items-center gap-4 mb-8">
        {/* Back button goes back to the specific user's detail page */}
        <Link href={`/admin/users/${userId}`}>
          <IoMdArrowBack size={28} />
        </Link>
        <h2 className="text-3xl font-bold text-[#002f34]">
          {userName}'s Listings
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          All listings by {userName}
        </h2>
        {/* 🔹 Loading & Empty State */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No listings found for {userName}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <Link
                key={item._id}
                href={`/admin/listings/${item._id}`}
                className="group"
              >
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-40 w-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.images &&
                    item.images.length > 0 &&
                    item.images[0]?.url ? (
                      <img
                        src={`${API_URL}${item.images[0].url}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <FiImage size={48} className="text-gray-400" />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-[#002f34] text-lg mb-1">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3">
                      {item.category || "General"}
                    </p>

                    <p className="text-[#007bff] font-bold text-base">
                      Rs.{item.price}/day
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}