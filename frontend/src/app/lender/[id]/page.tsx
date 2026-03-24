"use client";

import React, { useState, useEffect, use } from 'react';
import ListingCard from "@/components/ListingCard";
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';

export default function LenderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lenderId = resolvedParams.id;

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lenderName, setLenderName] = useState("Loading...");

  useEffect(() => {
    const fetchLenderAds = async () => {
      setIsLoading(true);
      try {
        // Fetch using your perfectly prepared backend route!
        const response = await fetch(`http://localhost:5000/api/listings/lender/${lenderId}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          setListings(result.data);
          // Grab the lender's name from the first populated listing
          setLenderName(result.data[0].lenderId?.name || "Rentza User");
        } else {
          setLenderName("Rentza User"); // Fallback if they have 0 active ads
        }
      } catch (error) {
        console.error("Error fetching lender ads:", error);
        setLenderName("User Not Found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLenderAds();
  }, [lenderId]);

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-5 min-h-screen pt-[50px]">
      
      {/* 1. PUBLIC PROFILE HEADER */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-[#002f34] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
           {lenderName.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#002f34] capitalize mb-2">{lenderName}</h1>
          <p className="text-gray-500 font-medium">
            Verified Rentza Member
          </p>
          <div className="mt-3 inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">
            {listings.length} Active {listings.length === 1 ? 'Ad' : 'Ads'}
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* 2. LENDER'S ADS GRID */}
      <h2 className="text-2xl font-bold text-[#002f34] mb-6">
        Published Ads
      </h2>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse text-lg">
          Loading {lenderName}'s ads...
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <ListingCard key={item._id} data={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <FiUser className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">No active ads</h3>
          <p className="text-gray-500 mt-2">This user currently doesn't have any items available for rent.</p>
          <Link href="/" className="inline-block mt-6 text-[#007bff] font-bold hover:underline">
            Return to Homepage
          </Link>
        </div>
      )}
      
    </div>
  );
}