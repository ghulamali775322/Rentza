"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiSearch, FiEye } from "react-icons/fi";
import { getListings } from "@/app/api/admin/listings"; // ✅ make sure the path is correct

// --- TYPES ---
interface Listing {
  id: string;
  title: string;
  category: string;
  owner: string;
  price: string;
  imageCount?: number;
  cloudReason?: string;
  date?: string;
}

// --- TABS ---
const TABS = ["Total", "Active", "Inactive", "Pending"];

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const initialTab =
    statusParam === "active"
      ? "Active"
      : statusParam === "inactive"
        ? "Inactive"
        : statusParam === "pending"
          ? "Pending"
          : "Total";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch listings whenever tab changes ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let status: string | undefined = undefined;
        if (activeTab === "Active") status = "active";
        else if (activeTab === "Inactive") status = "inactive";
        else if (activeTab === "Pending") status = "pending";

        const res = await getListings(status);
        if (res.data.success && res.data.data) {
          const mappedData: Listing[] = res.data.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            category: item.category,
            owner: item.lenderId?.name || "Unknown",
            price: item.price ? `${item.price}` : "-", // show "-" if no price
            imageCount: item.images?.length || 0,
            cloudReason:
              activeTab === "Pending"
                ? item.images && item.images.length > 0
                  ? item.images.some((img: any) => img.status === "rejected")
                    ? "Rejected"
                    : "Pending"
                  : "Rejected"
                : undefined,
            date:
              activeTab === "Pending"
                ? item.createdAt.split("T")[0]
                : undefined,
          }));
          setListings(mappedData);
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // --- Search filter ---
  const filteredListings = listings.filter((listing) => {
    return (
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      {/* --- TABS --- */}
      <div className="flex items-center gap-4 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-40 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#1d4ed8] text-white border border-[#1d4ed8]"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab} Listings
          </button>
        ))}
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <div className="relative w-120 max-w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500 text-lg" />
          </div>
          <input
            type="text"
            className="block w-full text-gray-500 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#007bff] sm:text-sm"
            placeholder="Search by title, category, owner, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8f9fa]">
              {activeTab === "Pending" ? (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Image Metadata
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Listing Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Cloud Vision Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Listing ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              )}
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading listings...
                  </td>
                </tr>
              ) : filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {activeTab === "Pending" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {listing.imageCount} image(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#002f34]">
                          {listing.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {listing.owner}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-100 max-w-[200px] leading-tight">
                            {listing.cloudReason || "Pending review"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {listing.date}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {listing.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#002f34]">
                          {listing.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {listing.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {listing.owner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#002f34]">
                          {listing.price}
                        </td>
                      </>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/listings/${listing.id}?tab=${activeTab}`}
                      >
                        <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[140px]">
                          <FiEye size={16} />
                          <span className="font-semibold whitespace-nowrap">
                            {activeTab === "Pending"
                              ? "Review"
                              : "View Details"}
                          </span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No {activeTab === "Total" ? "" : activeTab.toLowerCase()}{" "}
                    listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
