"use client";

import React from "react";
import { FiUsers, FiPackage, FiUserCheck } from "react-icons/fi";
import BeautifulLineChart from "../../components/BeautifulLineChart";

const STATS = [
  { label: "Total Users", value: "12,458", icon: FiUsers, color: "#007bff", bg: "#e6f2ff" },
  { label: "Active Users", value: "8,932", icon: FiUserCheck, color: "#00c851", bg: "#e6f9ec" },
  { label: "Active Listings", value: "2,891", icon: FiPackage, color: "#8e44ad", bg: "#f3e5f5" },
];

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
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className="w-full">

      {/* --- TOP STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {STATS.map((stat, index) => (
    <div
      key={index}

      // hover events
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}

      className="bg-white rounded-xl p-6 flex items-center justify-between transition-all duration-300 cursor-pointer shadow-sm"

      // dynamic border color
      style={{
        border: "1px solid",
        borderColor: hoveredIndex === index ? stat.color : "#f3f4f6",
      }}
    >
      {/* TEXT */}
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
        <h2 className="text-3xl font-bold text-[#002f34]">{stat.value}</h2>
      </div>

      {/* ICON BOX */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
        style={{
          backgroundColor: stat.color,
          color: "#ffffff",
        }}
      >
        <stat.icon />
      </div>
    </div>
  ))}
</div>
      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#002f34] mb-6">User Growth (Monthly)</h3>

          <BeautifulLineChart
            data={USER_GROWTH}
            color="#007bff"
            label="Monthly Sign-ups"
          />
        </div>

        {/* Listings Growth Chart */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#002f34] mb-6">Listings Growth (Monthly)</h3>

          <BeautifulLineChart
            data={LISTING_GROWTH}
            color="#8e44ad"
            label="Monthly Listings"
          />
        </div>
      </div>
    </div>
  );
}
