"use client";

import React, { use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { FiAlertTriangle, FiClock, FiSlash, FiImage, FiX } from 'react-icons/fi';

// --- MOCK DATA ---
const USER_DATA = {
  id: 'U001',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, New York, NY 10001',
  status: 'Active',
  joinedDate: '2024-01-15',
  totalListings: 5,
};

const USER_LISTINGS = [
  {
    id: 1,
    title: 'Professional DSLR Camera',
    category: 'Electronics',
    price: '$50/day',
    bg: 'bg-gray-800',
  },
  {
    id: 2,
    title: 'Vintage Mustang Car',
    category: 'Vehicles',
    price: '$300/day',
    bg: 'bg-gray-300',
  },
];

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the promise
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const searchParams = useSearchParams();
const reportId = searchParams.get('reportId');

  const [showWarnModal, setShowWarnModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  return (
    <div className="w-full max-w-7xl mx-auto p-6">

      {/* --- HEADER ROW --- */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
  // If we have a ticket, go back to that specific report. Otherwise, go to user list.
  href={reportId ? `/admin/reports/${reportId}` : "/admin/users"} 
>
          <IoMdArrowBack size={28} />
        </Link>
        <h1 className="text-3xl font-bold text-[#002f34]">User Details</h1>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-2 space-y-8">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-[#002f34]">Profile Information</h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider 
                ${USER_DATA.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {USER_DATA.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">User ID</label>
                <p className="text-base font text-[#002f34]">{userId}</p>
              </div>
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <p className="text-base font text-[#002f34]">{USER_DATA.name}</p>
              </div>
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Address</label>
                <p className="text-sm font text-[#002f34]">{USER_DATA.address}</p>
              </div>
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                <p className="text-sm font text-[#002f34]">{USER_DATA.phone}</p>
              </div>
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Joined Date</label>
                <p className="text-sm font text-[#002f34]">{USER_DATA.joinedDate}</p>
              </div>
              <div>
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Total Listings</label>
                <p className="text-sm font text-[#002f34]">{USER_DATA.totalListings}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <p className="text-sm font text-[#002f34]">{USER_DATA.email}</p>
              </div>
            </div>
          </div>

          {/* ITEMS LISTED */}
          <div>
            <h2 className="text-xl font-bold text-[#002f34] mb-4">Items Listed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {USER_LISTINGS.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className={`h-40 w-full ${item.bg} flex items-center justify-center text-white/30 group-hover:scale-105 transition-transform duration-300`}>
                    <FiImage size={48} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#002f34] text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                    <p className="text-[#007bff] font-bold text-base">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setShowWarnModal(true)} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white  rounded-lg font-bold transition-all shadow-sm active:scale-95"
              >
                <FiAlertTriangle size={20} />
                Warn User
              </button>
              <button 
                onClick={() => setShowSuspendModal(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
              >
                <FiClock size={20} />
                Suspend User
              </button>
              <button 
                onClick={() => setShowBanModal(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
              >
                <FiSlash size={20} />
                Ban User
              </button>
            </div>
          </div>
        </div>

      </div> {/* --- END OF GRID --- */}

      {/* --- WARN USER MODAL --- */}
      {showWarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Warn User</h3>
              <button 
                onClick={() => setShowWarnModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Are you sure you want to issue a warning to <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>?
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowWarnModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Warning Issued!');
                  setShowWarnModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-white font-bold text-sm hover:bg-[#d97706] transition-colors shadow-sm"
              >
                Issue Warning
              </button>
            </div>

          </div>
        </div>
      )}

      
    {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Suspend User</h3>
              <button 
                onClick={() => setShowSuspendModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to suspend <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>? 
                The user will not be able to access their account until the suspension is lifted.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('User Suspended!');
                  setShowSuspendModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#ff6b00] text-white font-bold text-sm hover:bg-[#e65100] transition-colors shadow-sm"
              >
                Suspend User
              </button>
            </div>

          </div>
        </div>
      )}
    {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Ban User</h3>
              <button 
                onClick={() => setShowBanModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to permanently ban <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>? 
                This action cannot be undone and the user will lose all access to the platform.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('User Banned!');
                  setShowBanModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828] transition-colors shadow-sm"
              >
                Ban User
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}