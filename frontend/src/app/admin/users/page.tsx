"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch, FiEye } from "react-icons/fi";
import { getUsers } from "@/app/api/admin/users";

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  totalListings: number;
  isActive: boolean;
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status"); // "total" | "active" | "inactive"

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (statusParam === "active") return "Active";
    if (statusParam === "inactive") return "Inactive";
    return "Total"; // default
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(); // from your API layer
      const mappedUsers: User[] = res.data.data.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        joinedDate: new Date(user.createdAt).toISOString().split("T")[0],
        totalListings: user.totalListings || 0,
        isActive: user.isActive,
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 FILTER USERS BASED ON TAB AND SEARCH
  const filteredUsers = users.filter((user: User) => {
    let matchesTab = true;
    if (activeTab === "Active") matchesTab = user.isActive;
    if (activeTab === "Inactive") matchesTab = !user.isActive;
    // Total → show all

    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* --- TAB BUTTONS --- */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("Total")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
            activeTab === "Total"
              ? "bg-[#1a56db] text-white border-[#1a56db]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          Total Users
        </button>

        <button
          onClick={() => setActiveTab("Active")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
            activeTab === "Active"
              ? "bg-[#1a56db] text-white border-[#1a56db]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          Active Users
        </button>

        <button
          onClick={() => setActiveTab("Inactive")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
            activeTab === "Inactive"
              ? "bg-[#1a56db] text-white border-[#1a56db]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          Inactive Users
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-5">
        <div className="relative text-black w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500 text-lg" />
          </div>
          <input
            type="text"
            className="block text-gray-500 w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:ring-[#007bff] focus:border-[#007bff] sm:text-sm"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- USERS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Listings
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: User) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {user.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#002f34]">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.joinedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 pl-10">
                    {user.totalListings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/users/${user.id}?type=${activeTab}`}>
                      <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[130px]">
                        <FiEye size={18} />
                        <span className="font-semibold whitespace-nowrap">
                          User Details
                        </span>
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No users found in this tab matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-500">
          Showing <b>{filteredUsers.length}</b> users
        </div>
      </div>
    </div>
  );
}
