"use client";
import ReportModal from "@/components/modals/ReportModal";

import React, { use, useState } from "react"; // Added useState
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_LISTINGS } from "@/data/mockListings";
import { 
  FiMapPin, 
  FiCalendar, 
  FiShare2, 
  FiHeart, 
  FiPhone, 
  FiMessageCircle,
  FiFlag,
  FiUser,
  FiChevronRight,
  FiFileText
} from "react-icons/fi";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);
  const listing = MOCK_LISTINGS.find((item) => item.id === id);
  const [isReportOpen, setIsReportOpen] = useState(false);


  // State to toggle phone number visibility
  const [showPhone, setShowPhone] = useState(false);

  if (!listing) {
    notFound();
  }

  // Mock data for seller (You can add these to your MOCK_LISTINGS later)
  const sellerInfo = {
    name: "Ghulam Ali",
    memberSince: "Dec 2023",
    activeAds: "3",
    phone: "0300-6265873" // Example phone number
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[50px] pb-10">
      
      {/* --- BREADCRUMB --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-base text-gray-500">
          <Link href="/" className="hover:text-blue-800">Home</Link> / 
          <Link href={`/search?category=${encodeURIComponent(listing.category)}`} className="hover:text-blue-600 mx-1">
            {listing.category}
          </Link> / 
          <span className="text-gray-700 ml-1 truncate">{listing.title}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === LEFT COLUMN (Main Content) === */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 1. IMAGE GALLERY SECTION */}
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center h-[400px] relative group">
            <img 
              src={listing.image} 
              alt={listing.title} 
              className="h-full w-full object-contain"
            />
            {/* Overlay Buttons (Top Right) */}
            <div className="absolute top-4 right-4 flex gap-3 z-10">
              <button className="bg-white p-2.5 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer">
                <FiShare2 size={20} className="text-gray-700" />
              </button>
              <button className="bg-white p-2.5 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer">
                <FiHeart size={20} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* 2. PRICE & TITLE CARD */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{listing.price}</h1>
                <h2 className="text-xl text-gray-700 mt-2">{listing.title}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <FiMapPin /> {listing.location}
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar /> Posted 2 days ago
              </div>
            </div>
          </div>

         
          {/* 4. DESCRIPTION SECTION */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              Selling my {listing.title}. It is in excellent condition and has been used carefully. 
              {listing.category === 'Cars' && " Driven mostly on highways, timely maintained, and fuel efficient."}
              {"\n\n"}
              Genuine buyers typically contact. Price is slightly negotiable. 
              {"\n\n"}
              Thank you.
            </p>
          </div>
        </div>

        {/* === RIGHT COLUMN (Sidebar / Seller Info) === */}
        <div className="space-y-4">
          
          {/* 1. SELLER PROFILE CARD (UPDATED DESIGN) */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Top Section: Avatar & Name */}
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white relative">
                   {/* Simplified Avatar Icon */}
                   <FiUser size={32} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Posted by</p>
                  <h3 className="font-bold text-lg text-gray-900">{sellerInfo.name}</h3>
                </div>
              </div>
              <FiChevronRight className="text-gray-400 text-xl" />
            </div>

            <hr className="border-gray-100" />

            {/* Bottom Section: Member Since & Active Ads */}
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                 <div className="mt-1 text-blue-600"><FiCalendar /></div>
                 <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="font-bold text-gray-800 text-sm">{sellerInfo.memberSince}</p>
                 </div>
              </div>
              <div className="flex items-start gap-2">
                 <div className="mt-1 text-blue-600"><FiFileText /></div>
                 <div>
                    <p className="text-xs text-gray-500">Active Ads</p>
                    <p className="font-bold text-gray-800 text-sm">{sellerInfo.activeAds}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* 2. ACTION BUTTONS */}
          <div className="space-y-3">
            {/* Show Phone Number Button */}
            <button 
              onClick={() => setShowPhone(true)}
              className={`w-full font-bold py-3 rounded flex items-center justify-center gap-2 transition ${
                showPhone ? "bg-green-600 text-white" : "bg-[#002f34] text-white hover:bg-[#004247]"
              }`}
            >
              <FiPhone size={20} />
              {showPhone ? sellerInfo.phone : "Show Phone Number"}
            </button>

             {/* === CHANGED: CHAT BUTTON IS NOW A LINK === */}
             
            <Link 
              // We pass the seller name in the URL query
              href={`/chat?user=${encodeURIComponent(sellerInfo.name)}`} 
              className="w-full border-2 border-[#002f34] text-[#002f34] font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <FiMessageCircle size={20} />
              Chat
            </Link>
            </div>

          {/* 3. LOCATION MAP PLACEHOLDER */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Location</h3>
            <div className="flex items-center gap-2 text-gray-700 text-sm mb-3">
              <FiMapPin size={18} />
              {listing.location}
            </div>
            {/* Fake Map Image */}
            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
              Map Preview Placeholder
            </div>
          </div>

          {/* 4. REPORT AD (UPDATED:  Button Only) */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <div className="flex justify-center">
                <button 
                     onClick={() => setIsReportOpen(true)}
                        className="flex items-center gap-2 text-red-600 font-bold hover:underline text-sm"
                            >
                     <FiFlag size={18} /> 
                   Report this ad
                  </button>
             </div>
          </div>

        </div>

      </div>
       <ReportModal 
      isOpen={isReportOpen}
      onClose={() => setIsReportOpen(false)}
      type="ad"
      id={listing.id}
    />
    </div>
  );
}