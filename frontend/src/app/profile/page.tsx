"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

import React from "react";
import { FiMapPin, FiCalendar, FiShare2 } from "react-icons/fi";

export default function PublicProfilePage() {
  // Dummy data for the view
  const user = {
    name: "Ghulam Ali",
    joinDate: "Nov 2023",
    location: "Lahore, Pakistan",
    followers: 12,
    following: 4,
    ads: [
      {
        id: 1,
        title: "Canon DSLR Camera for Rent",
        price: "PKR 4,500",
        loc: "DHA, Lahore",
      },
      {
        id: 2,
        title: "Honda Civic 2022",
        price: "PKR 15,000",
        loc: "Gulberg, Lahore",
      },
      {
        id: 3,
        title: "Wedding Marquee Setup",
        price: "PKR 50,000",
        loc: "Johar Town, Lahore",
      },
    ],
  };

  return (
    <ProtectedRoute>
      // ProfileContainer: max-w-1100px, margin auto, px-5 py-10, pt-30px,
      min-h-screen, bg-gray, flex, gap-30px
      <div className="max-w-[1100px] mx-auto px-5 pt-[100px] pb-24 md:py-10 md:pt-[30px] min-h-screen bg-[#f8f9fa] flex gap-[30px] max-md:flex-col">
        {/* --- LEFT COLUMN: User Details (UserCard) --- */}
        {/* width 350px, bg-white, border, rounded, p-30px 20px, height-fit, text-center */}
        <div className="w-[350px] bg-white border border-[#dedede] rounded p-[30px_20px] h-fit text-center max-md:w-full">
          {/* AvatarLarge */}
          <div className="w-[120px] h-[120px] bg-[#007bff] text-white text-[48px] font-bold rounded-full flex justify-center items-center mx-auto mb-5">
            {user.name.charAt(0)}
          </div>

          {/* UserName */}
          <h1 className="text-2xl font-extrabold text-[#002f34] mb-[5px]">
            {user.name}
          </h1>

          {/* UserMeta */}
          <div className="text-[#555] text-sm mb-5 flex justify-center gap-[15px]">
            <span className="flex items-center gap-[5px]">
              <FiCalendar /> Member since {user.joinDate}
            </span>
          </div>

          {/* Divider */}
          <hr className=" border-t border-[#eee] my-5" />

          {/* ShareButton */}
         <button
            onClick={() => alert("Link copied to clipboard!")}
            className="w-full md:w-[80%] p-3 bg-white border border-[#002f34] text-[#002f34] font-bold rounded-md mt-[15px] flex items-center justify-center gap-[10px] cursor-pointer text-base transition-all duration-200 mx-auto hover:bg-[#002f34] hover:text-white"
          >
            <FiShare2 className="text-xl" />
            Share user profile
          </button>
        </div>

        {/* --- RIGHT COLUMN: Published Ads (ContentArea) --- */}
        {/* flex-1, bg-white, border, rounded, p-20px */}
        <div className="flex-1 bg-white border border-[#dedede] rounded p-5">
          {/* SectionHeader */}
          <h2 className="text-xl font-bold text-[#002f34] mb-5 pb-[10px] border-b border-[#ccc]">
            Published Ads
          </h2>

          {/* AdsGrid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {user.ads.map((ad) => (
              // AdCard
              <div
                key={ad.id}
                className="bg-white border border-[#e0e0e0] rounded overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                {/* AdImage */}
                <div className="h-[150px] bg-[#eee] flex items-center justify-center text-[#888]">
                  Image
                </div>

                {/* AdContent */}
                <div className="p-[15px]">
                  {/* Price */}
                  <div className="text-lg font-bold text-[#002f34] mb-[5px]">
                    {ad.price}
                  </div>
                  {/* AdTitle */}
                  <div className="text-sm text-[#555] whitespace-nowrap overflow-hidden text-ellipsis mb-[10px]">
                    {ad.title}
                  </div>
                  {/* AdLocation */}
                  <div className="text-xs text-[#888] flex items-center gap-[5px]">
                    <FiMapPin /> {ad.loc}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State Example */}
            {user.ads.length === 0 && (
              <p className="text-[#666]">No ads published yet.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
