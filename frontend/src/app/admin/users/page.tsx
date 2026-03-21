"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  totalListings: number;
}

// --- MOCK DATA ---
const USERS_DATA: User[] = [
  { id: 'U001', name: 'John Smith', email: 'john.smith@email.com',  joinedDate: '2024-01-15', totalListings: 5 },
  { id: 'U002', name: 'Sarah Johnson', email: 'sarah.j@email.com',  joinedDate: '2024-02-20', totalListings: 3 },
  { id: 'U003', name: 'Michael Brown', email: 'mbrown@email.com',  joinedDate: '2024-03-10', totalListings: 8 },
  { id: 'U004', name: 'Emily Davis', email: 'emily.davis@email.com', joinedDate: '2024-04-05', totalListings: 12 },
  { id: 'U005', name: 'Robert Wilson', email: 'rwilson@email.com',  joinedDate: '2024-05-12', totalListings: 2 },
  { id: 'U006', name: 'Linda Martinez', email: 'linda.m@email.com', joinedDate: '2024-06-01', totalListings: 0 },
  { id: 'U007', name: 'David Lee', email: 'david.lee@email.com',    joinedDate: '2024-06-15', totalListings: 4 },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

  // 👇 CHANGE 1: Update the filter to check BOTH the search bar AND the active tab
  const filteredUsers = USERS_DATA.filter((user) => {
const inactiveIds = ['U003', 'U005']; 
const matchesTab = activeTab === 'Active'
  ? !inactiveIds.includes(user.id)
  : inactiveIds.includes(user.id);

    // 2. Does the user match the search text?
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Only show the user if they match BOTH rules
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full">
      
      {/* 👇 CHANGE 2: Add the Tab Buttons right above the search bar 👇 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('Active')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
            activeTab === 'Active'
              ? 'bg-[#1a56db] text-white border-[#1a56db]' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300' 
          }`}
        >
          Active Users
        </button>

        <button
          onClick={() => setActiveTab('Inactive')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
            activeTab === 'Inactive'
              ? 'bg-[#1a56db] text-white border-[#1a56db]' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300' 
          }`}
        >
          Inactive Users
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-5">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500 text-lg" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:ring-[#007bff] focus:border-[#007bff] sm:text-sm"
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
            {/* Table Header */}
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>

                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Total Listings</th>
                 <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  
                  {/* ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {user.id}
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#002f34]">{user.name}</div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.joinedDate}
                  </td>

                  {/* Listings Count */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 pl-10">
                    {user.totalListings}
                  </td>

                 {/* Actions (Blue Button) */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/users/${user.id}?type=${activeTab}`}>
                               <button 
                       className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[130px]"
                              >
                           <FiEye size={18} />
                         <span className="font-semibold whitespace-nowrap">User Details</span>
                                   </button>
                                       </Link>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
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