"use client";

import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiPackage,
  FiAlertCircle,
  FiUserCheck,
  FiClock,
} from "react-icons/fi";
import { LuPackageCheck } from "react-icons/lu";
import { getUsersStats } from "@/app/api/admin/users";
import Link from "next/link";

export default function AdminDashboard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [dashboardStats, setDashboardStats] = useState<{
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    pendingReports: number;
    totalUsers: number;
    activeUsers: number;
  }>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    pendingReports: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  const statsData = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      icon: FiUsers,
      color: "#007bff",
      bgColor: "#e6f2ff",
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: dashboardStats.activeUsers,
      icon: FiUserCheck,
      color: "#00c851",
      bgColor: "#e6f9ec",
      href: "/admin/users?status=active",
    },
    {
      title: "Total Listings",
      value: dashboardStats.totalListings,
      icon: FiPackage,
      color: "#8e44ad",
      bgColor: "#f3e5f5",
      href: "/admin/listings",
    },
    {
      title: "Active Listings",
      value: dashboardStats.activeListings,
      icon: LuPackageCheck,
      color: "#6c5ce7",
      bgColor: "#ede7f6",
      href: "/admin/listings?status=active",
    },
    {
      title: "Pending Listings",
      value: dashboardStats.pendingListings,
      icon: FiClock,
      color: "#ff8800",
      bgColor: "#fff3e0",
      href: "/admin/listings?status=pending",
    },
    {
      title: "Pending Reports",
      value: dashboardStats.pendingReports,
      icon: FiAlertCircle,
      color: "#ff3547",
      bgColor: "#ffebee",
      href: "/admin/reports?tab=pending",
    },
  ];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await getUsersStats();
        if (res.data.success && res.data.data) {
          setDashboardStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const isClickable = !!stat.href; // true if href exists

          const cardContent = (
            <div
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`bg-white px-6 h-[180px] rounded-xl border border-gray-100 flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-lg ${
                isClickable ? "cursor-pointer" : ""
              }`}
              style={{
                borderColor: hoveredIndex === index ? stat.color : "#f3f4f6",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              {/* Left Side */}
              <div>
                <h4 className="text-sm text-gray-500 font-medium mb-1">
                  {stat.title}
                </h4>
                <h2 className="text-3xl font-bold text-[#002f34]">
                  {stat.value}
                </h2>
              </div>

              {/* Right Side: Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-md"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon />
              </div>
            </div>
          );

          return isClickable ? (
            <Link key={index} href={stat.href}>
              {cardContent}
            </Link>
          ) : (
            <div key={index}>{cardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
