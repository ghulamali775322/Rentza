"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi'; // Added FiEye

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Banned';
  joinedDate: string;
  totalListings: number;
}

// --- MOCK DATA ---
const USERS_DATA: User[] = [
  { id: 'U001', name: 'John Smith', email: 'john.smith@email.com', status: 'Active', joinedDate: '2024-01-15', totalListings: 5 },
  { id: 'U002', name: 'Sarah Johnson', email: 'sarah.j@email.com', status: 'Active', joinedDate: '2024-02-20', totalListings: 3 },
  { id: 'U003', name: 'Michael Brown', email: 'mbrown@email.com', status: 'Suspended', joinedDate: '2024-03-10', totalListings: 8 },
  { id: 'U004', name: 'Emily Davis', email: 'emily.davis@email.com', status: 'Active', joinedDate: '2024-04-05', totalListings: 12 },
  { id: 'U005', name: 'Robert Wilson', email: 'rwilson@email.com', status: 'Banned', joinedDate: '2024-05-12', totalListings: 2 },
  { id: 'U006', name: 'Linda Martinez', email: 'linda.m@email.com', status: 'Active', joinedDate: '2024-06-01', totalListings: 0 },
  { id: 'U007', name: 'David Lee', email: 'david.lee@email.com', status: 'Active', joinedDate: '2024-06-15', totalListings: 4 },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search
  const filteredUsers = USERS_DATA.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get status badge styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Suspended': return 'bg-orange-100 text-orange-700'; 
      case 'Banned': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
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

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(user.status)}`}>
                      {user.status}
                    </span>
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
                    <Link href={`/admin/users/${user.id}`}>
                    <button 
                      // CHANGE 1: Added 'w-[150px]' to increase length.
                      // 'flex' aligns items in a row by default.
                      className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[130px]"
                      onClick={() => console.log(`View details for ${user.name}`)}
                    >
                      <FiEye size={18} />
                      
                      {/* CHANGE 2: Removed the 'flex-col' div. Used a simple span with 'whitespace-nowrap' to keep it on one line. */}
                      <span className="font-semibold whitespace-nowrap">User Details</span>
                    </button>
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No users found matching your search.
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
          Showing <b>1</b> to <b>{filteredUsers.length}</b> of <b>{USERS_DATA.length}</b> users
        </div>
      </div>
    </div>
  );
}