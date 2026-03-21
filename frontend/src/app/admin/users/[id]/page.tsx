"use client";

import React, { use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { FiClock, FiX, FiTrash2, FiCheckCircle, FiList } from 'react-icons/fi';

// --- MOCK DATA ---
const USER_DATA = {
  id: 'U001',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, New York, NY 10001',
  joinedDate: '2024-01-15',
  totalListings: 5,
};

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
const userType = searchParams.get('type');
  // Modal States
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">

      {/* --- HEADER ROW --- */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={reportId ? `/admin/reports/${reportId}` : "/admin/users"}>
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
        </div>

        {/* === RIGHT COLUMN (ACTIONS) === */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            <div className="space-y-4">
              
             {userType === 'Active' ? (
  <>
    <button 
      onClick={() => setShowSuspendModal(true)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiClock size={20} /> Suspend User
    </button>
    <button 
      onClick={() => setShowDeleteModal(true)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiTrash2 size={20} /> Delete User
    </button>
    <Link 
      href={`/admin/users/${userId}/listings`}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiList size={20} /> View User's Listings
    </Link>
  </>
) : (
  <>
    <button 
      onClick={() => setShowUnsuspendModal(true)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiCheckCircle size={20} /> Unsuspend User
    </button>
    <button 
      onClick={() => setShowDeleteModal(true)}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiTrash2 size={20} /> Delete User
    </button>
    <Link 
      href={`/admin/users/${userId}/listings`}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95"
    >
      <FiList size={20} /> View User's Listings
    </Link>
  </>
)}

            </div>
          </div>
        </div>

      </div> {/* --- END OF GRID --- */}


      {/* --- MODALS --- */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Suspend User</h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to suspend <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>? 
                They will not be able to access their account.
              </p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowSuspendModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { alert('User Suspended!'); setShowSuspendModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#ff6b00] text-white font-bold text-sm hover:bg-[#e65100]">
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnsuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Unsuspend User</h3>
              <button onClick={() => setShowUnsuspendModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to restore access for <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>?
              </p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowUnsuspendModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { alert('User Restored!'); setShowUnsuspendModal(false); }} className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700">
                Unsuspend User
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Delete User</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-[#002f34]">{USER_DATA.name}</span>? 
                This action cannot be undone and deletes all their data.
              </p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { alert('User Deleted!'); setShowDeleteModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828]">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}