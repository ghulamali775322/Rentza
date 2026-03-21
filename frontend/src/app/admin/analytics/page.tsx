"use client";

import React from "react";
import BeautifulLineChart from "../../components/BeautifulLineChart";

// --- GRAPH DATA ---
const USER_GROWTH = [
  { month: "Feb", value: 120 },
  { month: "Apr", value: 260 },
  { month: "Jun", value: 457 },
  { month: "Aug", value: 545 },
  { month: "Oct", value: 790 },
  { month: "Dec", value: 860 },
];

const LISTING_GROWTH = [
  { month: "Feb", value: 435 },
  { month: "Apr", value: 690 },
  { month: "Jun", value: 975 },
  { month: "Aug", value: 1355 },
  { month: "Oct", value: 1667 },
  { month: "Dec", value: 1987 },
];

export default function AnalyticsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      
      {/* --- PAGE HEADER (Fills the empty space at the top) --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#002f34] mb-2">Platform Analytics</h1>
        <p className="text-black-500 text-base">
          Detailed overview of user registrations and listing creation over the current year.
        </p>
      </div>

      {/* --- CHARTS SECTION (Stacked vertically for maximum width) --- */}
      <div className="flex flex-col gap-10">

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-[#002f34]">User Growth</h3>
              <p className="text-sm text-black-400 mt-1">Total new accounts created per month</p>
            </div>
            
          </div>
          
          {/* 👇 The h-[400px] class makes the chart much taller! */}
          <div className="h-[400px] w-full">
            <BeautifulLineChart
              data={USER_GROWTH}
              color="#007bff"
              label="Monthly Sign-ups"
            />
          </div>
        </div>

        {/* Listings Growth Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-[#002f34]">Listings Growth</h3>
              <p className="text-sm text-black-400 mt-1">Total new items published per month</p>
            </div>
            
          </div>
          
          {/* 👇 The h-[400px] class makes the chart much taller! */}
          <div className="h-[400px] w-full">
            <BeautifulLineChart
              data={LISTING_GROWTH}
              color="#8e44ad"
              label="Monthly Listings"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}