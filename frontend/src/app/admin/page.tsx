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
import DonutCard from "../components/DonutCard";

// 1. IMPORT TOAST
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [hoveredCard, setHoveredCard] = useState<{
    section: string;
    index: number;
  } | null>(null);
  const [dashboardStats, setDashboardStats] = useState<{
    totalListings: number;
    activeListings: number;
    pendingListings: number;

    totalReports: number;
    pendingReports: number;
    resolvedReports: number;

    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  }>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,

    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,

    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const usersChart = [
    {
      name: "Active",
      value: dashboardStats.activeUsers,
      color: "#22c55e",
    },
    {
      name: "Inactive",
      value: dashboardStats.inactiveUsers,
      color: "#ef4444",
    },
  ];

  const listingsChart = [
    {
      name: "Active",
      value: dashboardStats.activeListings,
      color: "#6366f1",
    },
    {
      name: "Pending",
      value: dashboardStats.pendingListings,
      color: "#f59e0b",
    },
  ];

  const reportsChart = [
    {
      name: "Pending",
      value: dashboardStats.pendingReports,
      color: "#ef4444",
    },
    {
      name: "Resolved",
      value: dashboardStats.resolvedReports,
      color: "#10b981",
    },
  ];
  const statsData = [
    // USERS
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      icon: FiUsers,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: dashboardStats.activeUsers,
      icon: FiUserCheck,
      color: "#22c55e",
      bgColor: "#ecfdf5",
      href: "/admin/users?status=active",
    },
    {
      title: "Inactive Users",
      value: dashboardStats.inactiveUsers,
      icon: FiUsers,
      color: "#ef4444",
      bgColor: "#fef2f2",
      href: "/admin/users?status=inactive",
    },

    // LISTINGS
    {
      title: "Total Listings",
      value: dashboardStats.totalListings,
      icon: FiPackage,
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
      href: "/admin/listings",
    },
    {
      title: "Active Listings",
      value: dashboardStats.activeListings,
      icon: LuPackageCheck,
      color: "#6366f1",
      bgColor: "#eef2ff",
      href: "/admin/listings?status=active",
    },
    {
      title: "Pending Listings",
      value: dashboardStats.pendingListings,
      icon: FiClock,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      href: "/admin/listings?status=pending",
    },

    // REPORTS
    {
      title: "Total Reports",
      value: dashboardStats.totalReports,
      icon: FiAlertCircle,
      color: "#0ea5e9",
      bgColor: "#f0f9ff",
      href: "/admin/reports",
    },
    {
      title: "Pending Reports",
      value: dashboardStats.pendingReports,
      icon: FiClock,
      color: "#ef4444",
      bgColor: "#fef2f2",
      href: "/admin/reports?status=pending",
    },
    {
      title: "Resolved Reports",
      value: dashboardStats.resolvedReports,
      icon: FiUserCheck,
      color: "#10b981",
      bgColor: "#ecfdf5",
      href: "/admin/reports?status=resolved",
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
        // 2. ADDED TOAST FOR API FAILURE
        toast.error("Failed to load dashboard statistics.");
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="w-full space-y-10">
      {/* ===================== */}
      {/* SYSTEM OVERVIEW */}
      {/* ===================== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          System Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <DonutCard title="Users Overview" data={usersChart} />
          <DonutCard title="Listings Overview" data={listingsChart} />
          <DonutCard title="Reports Overview" data={reportsChart} />
        </div>
      </div>

      {/* ===================== */}
      {/* USERS SECTION */}
      {/* ===================== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData
            .filter((stat) => stat.title.includes("User"))
            .map((stat, index) => {
              const isClickable = !!stat.href;

              const cardContent = (
                <div
                  onMouseEnter={() =>
                    setHoveredCard({ section: "users", index })
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                  className="
      group relative bg-white p-5 rounded-2xl border
      transition-all duration-300 cursor-pointer
      hover:-translate-y-2 hover:shadow-2xl
    "
                  style={{
                    borderColor:
                      hoveredCard?.section === "users" &&
                      hoveredCard?.index === index
                        ? stat.color
                        : "#eef0f3",

                    boxShadow:
                      hoveredCard?.section === "users" &&
                      hoveredCard?.index === index
                        ? `0 20px 60px ${stat.color}22`
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  {/* BACKGROUND GLOW */}
                  <div
                    className="
        absolute inset-0 rounded-2xl opacity-0
        group-hover:opacity-100 transition-all duration-300
      "
                    style={{
                      background: `radial-gradient(
          circle at top left,
          ${stat.color}35,
          transparent 65%
        )`,
                    }}
                  />

                  {/* CONTENT */}
                  <div className="relative flex items-center justify-between">
                    {/* LEFT SIDE */}
                    <div>
                      <p
                        className="
          text-xs uppercase tracking-wider font-medium
          text-gray-400 group-hover:text-gray-600
          transition-colors duration-300
        "
                      >
                        {stat.title}
                      </p>

                      <h2
                        className="
          text-3xl font-bold text-gray-900 mt-1
          group-hover:scale-105 transition-transform duration-300 origin-left
        "
                      >
                        {stat.value}
                      </h2>
                    </div>

                    {/* ICON */}
                    <div
                      className="
          w-12 h-12 rounded-xl flex items-center justify-center
          text-white shadow-md transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
        "
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,

                        boxShadow:
                          hoveredCard?.section === "users" &&
                          hoveredCard?.index === index
                            ? `0 10px 25px ${stat.color}55`
                            : "none",
                      }}
                    >
                      <stat.icon className="text-xl" />
                    </div>
                  </div>

                  {/* TOP ACCENT BAR */}
                  <div
                    className="
        absolute top-0 left-4 right-4 h-[2px]
        rounded-full opacity-0 group-hover:opacity-100
        transition-all duration-300
      "
                    style={{
                      background: stat.color,
                    }}
                  />
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

      {/* ===================== */}
      {/* LISTINGS SECTION */}
      {/* ===================== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Listings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData
            .filter((stat) => stat.title.includes("Listing"))
            .map((stat, index) => {
              const isClickable = !!stat.href;

              const cardContent = (
                <div
                  onMouseEnter={() =>
                    setHoveredCard({ section: "listings", index })
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                  className="
      group relative bg-white p-5 rounded-2xl border
      transition-all duration-300 cursor-pointer
      hover:-translate-y-2 hover:shadow-2xl
    "
                  style={{
                    borderColor:
                      hoveredCard?.section === "listings" &&
                      hoveredCard?.index === index
                        ? stat.color
                        : "#eef0f3",

                    boxShadow:
                      hoveredCard?.section === "listings" &&
                      hoveredCard?.index === index
                        ? `0 20px 60px ${stat.color}22`
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  {/* BACKGROUND GLOW */}
                  <div
                    className="
        absolute inset-0 opacity-0
        group-hover:opacity-100 transition-all duration-300
        rounded-2xl
      "
                    style={{
                      background: `radial-gradient(
          circle at top left,
          ${stat.color}35,
          transparent 65%
        )`,
                    }}
                  />

                  {/* CONTENT */}
                  <div className="relative flex items-center justify-between">
                    {/* LEFT SIDE */}
                    <div>
                      <p
                        className="
          text-xs text-gray-400 font-medium tracking-wide uppercase
          group-hover:text-gray-600 transition-colors duration-300
        "
                      >
                        {stat.title}
                      </p>

                      <h2
                        className="
          text-3xl font-bold text-gray-900 mt-1
          group-hover:scale-105 origin-left transition-transform duration-300
        "
                      >
                        {stat.value}
                      </h2>
                    </div>

                    {/* ICON */}
                    <div
                      className="
          w-12 h-12 rounded-xl flex items-center justify-center
          text-white shadow-md transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
        "
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,

                        boxShadow:
                          hoveredCard?.section === "listings" &&
                          hoveredCard?.index === index
                            ? `0 10px 25px ${stat.color}55`
                            : "none",
                      }}
                    >
                      <stat.icon className="text-xl" />
                    </div>
                  </div>

                  {/* TOP ACCENT BAR */}
                  <div
                    className="
        absolute top-0 left-4 right-4 h-[2px]
        rounded-full opacity-0 group-hover:opacity-100
        transition-all duration-300
      "
                    style={{
                      background: stat.color,
                    }}
                  />
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

      {/* ===================== */}
      {/* REPORTS SECTION */}
      {/* ===================== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData
            .filter((stat) => stat.title.includes("Report"))
            .map((stat, index) => {
              const isClickable = !!stat.href;

              const cardContent = (
                <div
                  onMouseEnter={() =>
                    setHoveredCard({ section: "reports", index })
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                  className="
      group relative bg-white p-5 rounded-2xl border
      transition-all duration-300 cursor-pointer
      hover:-translate-y-2 hover:shadow-2xl
    "
                  style={{
                    borderColor:
                      hoveredCard?.section === "reports" &&
                      hoveredCard?.index === index
                        ? stat.color
                        : "#eef0f3",

                    boxShadow:
                      hoveredCard?.section === "reports" &&
                      hoveredCard?.index === index
                        ? `0 20px 60px ${stat.color}22`
                        : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  {/* BACKGROUND GLOW */}
                  <div
                    className="
        absolute inset-0 opacity-0
        group-hover:opacity-100 transition-all duration-300
        rounded-2xl
      "
                    style={{
                      background: `radial-gradient(
          circle at top left,
          ${stat.color}35,
          transparent 65%
        )`,
                    }}
                  />

                  {/* CONTENT */}
                  <div className="relative flex items-center justify-between">
                    {/* LEFT SIDE */}
                    <div>
                      <p
                        className="
          text-xs text-gray-400 font-medium tracking-wide uppercase
          group-hover:text-gray-600 transition-colors duration-300
        "
                      >
                        {stat.title}
                      </p>

                      <h2
                        className="
          text-3xl font-bold text-gray-900 mt-1
          group-hover:scale-105 origin-left transition-transform duration-300
        "
                      >
                        {stat.value}
                      </h2>
                    </div>

                    {/* ICON */}
                    <div
                      className="
          w-12 h-12 rounded-xl flex items-center justify-center
          text-white shadow-md transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
        "
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,

                        boxShadow:
                          hoveredCard?.section === "reports" &&
                          hoveredCard?.index === index
                            ? `0 10px 25px ${stat.color}55`
                            : "none",
                      }}
                    >
                      <stat.icon className="text-xl" />
                    </div>
                  </div>

                  {/* TOP ACCENT BAR */}
                  <div
                    className="
        absolute top-0 left-4 right-4 h-[2px]
        rounded-full opacity-0 group-hover:opacity-100
        transition-all duration-300
      "
                    style={{
                      background: stat.color,
                    }}
                  />
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
    </div>
  );
}
