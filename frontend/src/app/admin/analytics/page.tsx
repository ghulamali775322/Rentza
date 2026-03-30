"use client";

import React, { useEffect, useState } from "react";
import BeautifulLineChart from "../../components/BeautifulLineChart";
import { getUsersGrowth, getListingsGrowth } from "@/app/api/admin/analytics"; // ✅ make sure the path is correct

// Optional: you can keep a placeholder for listings growth if needed
const LISTING_GROWTH = [
  { month: "Feb", value: 435 },
  { month: "Apr", value: 690 },
  { month: "Jun", value: 975 },
  { month: "Aug", value: 1355 },
  { month: "Oct", value: 1667 },
  { month: "Dec", value: 1987 },
];

export default function AnalyticsPage() {
  const [userGrowth, setUserGrowth] = useState<
    { month: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [listingGrowth, setListingGrowth] = useState<
    { month: string; value: number }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // USERS
        const userRes = await getUsersGrowth();
        if (userRes.data.success && userRes.data.data) {
          const formattedUsers = userRes.data.data.map((item: any) => ({
            month: item.month,
            value: item.users,
          }));
          setUserGrowth(formattedUsers);
        }

        // LISTINGS 🔥
        const listingRes = await getListingsGrowth();
        if (listingRes.data.success && listingRes.data.data) {
          const formattedListings = listingRes.data.data.map((item: any) => ({
            month: item.month,
            value: item.listings, // ⚠️ adjust if backend uses different key
          }));
          setListingGrowth(formattedListings);
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // 🔥 Calculate Growth %
  const growthPercentage = (() => {
    if (userGrowth.length < 2) return 0;

    const last = userGrowth[userGrowth.length - 1].value;
    const prev = userGrowth[userGrowth.length - 2].value;

    if (prev === 0) return 100; // avoid division by zero

    return (((last - prev) / prev) * 100).toFixed(1);
  })();
  const listingGrowthPercentage = (() => {
    if (listingGrowth.length < 2) return 0;

    const last = listingGrowth[listingGrowth.length - 1].value;
    const prev = listingGrowth[listingGrowth.length - 2].value;

    if (prev === 0) return 100;

    return (((last - prev) / prev) * 100).toFixed(1);
  })();
  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      {/* --- PAGE HEADER --- */}
      <div className="mb-8 font-semibold text-gray-700">
        <p className="text-black-500 text-base">
          Detailed overview of user registrations and listing creation over the
          current year.
        </p>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="flex flex-col gap-10">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-[#002f34]">User Growth</h3>
              <p className="text-sm text-gray-500 mt-1">
                Total new accounts created per month
              </p>
            </div>
          </div>

          {/* 🔥 SUMMARY BLOCK (ADD THIS) */}
          {!loading && userGrowth.length > 0 && (
            <div className="flex gap-8 mb-6 flex-wrap">
              <div>
                <p className="text-sm text-gray-500">Total Users This Year</p>
                <p className="text-2xl font-bold text-[#002f34]">
                  {userGrowth.reduce((sum, item) => sum + item.value, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Most Users Registers</p>
                <p className="text-2xl font-bold text-[#002f34]">
                  {
                    userGrowth.reduce((max, item) =>
                      item.value > max.value ? item : max,
                    ).month
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Growth (Last Month)</p>
                <p
                  className={`text-2xl font-bold ${
                    Number(growthPercentage) >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {Number(growthPercentage) >= 0 ? "↑" : "↓"} {growthPercentage}
                  %{" "}
                </p>
              </div>
            </div>
          )}

          <div className="h-[400px] w-full">
            {loading ? (
              <p className="text-center text-gray-500">Loading chart...</p>
            ) : userGrowth.length === 0 ? (
              <p className="text-center text-gray-400">
                No user growth data available
              </p>
            ) : (
              <BeautifulLineChart
                data={userGrowth}
                color="#007bff"
                label="Monthly Sign-ups"
              />
            )}
          </div>
        </div>

        {/* Listings Growth Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-[#002f34]">
                Listings Growth
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total new items published per month
              </p>
            </div>
          </div>

          {/* 🔥 SUMMARY BLOCK */}
          {!loading && listingGrowth.length > 0 && (
            <div className="flex gap-8 mb-6 flex-wrap">
              <div>
                <p className="text-sm text-gray-500">
                  Total Listings This Year
                </p>
                <p className="text-2xl font-bold text-[#002f34]">
                  {listingGrowth.reduce((sum, item) => sum + item.value, 0)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Most Listings Created</p>
                <p className="text-2xl font-bold text-[#002f34]">
                  {
                    listingGrowth.reduce((max, item) =>
                      item.value > max.value ? item : max,
                    ).month
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Growth (Last Month)</p>
                <p
                  className={`text-2xl font-bold ${
                    Number(listingGrowthPercentage) >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {Number(listingGrowthPercentage) >= 0 ? "↑" : "↓"}{" "}
                  {listingGrowthPercentage}%
                </p>
              </div>
            </div>
          )}

          <div className="h-[400px] w-full">
            {loading ? (
              <p className="text-center text-gray-500">Loading chart...</p>
            ) : listingGrowth.length === 0 ? (
              <p className="text-center text-gray-400">
                No listing growth data available
              </p>
            ) : (
              <BeautifulLineChart
                data={listingGrowth}
                color="#8e44ad"
                label="Monthly Listings"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
