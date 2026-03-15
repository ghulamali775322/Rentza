"use client";

import React, { use, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { 
  FiTrash2, FiAlertTriangle, FiClock, FiCheckCircle, FiXCircle,FiX,
  FiImage, FiTag, FiCalendar, FiUser, FiDollarSign 
} from 'react-icons/fi';

// --- MOCK DATABASE (Simulates your Backend) ---
const MOCK_DB = [
  // 1. ACTIVE LISTING (Shows Standard Detail Form)
  {
    id: 'L001',
    status: 'Active',
    title: 'Professional DSLR Camera',
    category: 'Electronics',
    price: '500/day',
    description: 'High-quality Canon EOS R5 camera for professional photography. Includes 24-70mm lens and accessories.',
    dateCreated: '2024-10-15',
    ownerName: 'John Smith',
    ownerId: 'U001',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
    // Pending specific fields (empty for active)
    cloudReason: '',
    pendingImages: []
  },
  // 2. INACTIVE LISTING (Shows Standard Detail Form)
  {
    id: 'L002',
    status: 'Inactive',
    title: 'Mountain Bike',
    category: 'Sports',
    price: '1500/day',
    description: 'Trek mountain bike, barely used.',
    dateCreated: '2024-09-10',
    ownerName: 'Sarah Johnson',
    ownerId: 'U002',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80',
    cloudReason: '',
    pendingImages: []
  },
  // 3. PENDING LISTING (Shows Review Form)
  {
    id: 'P001',
    status: 'Pending',
    title: 'Gaming Console Bundle',
    category: 'Electronics',
    price: '400/day',
    description: 'PlayStation 5 with controllers.',
    dateCreated: '2024-11-20',
    ownerName: 'Alex Turner',
    ownerId: 'U006',
    imageUrl: '', // Main image might be empty until approved
    cloudReason: 'Possible violence in game imagery',
    pendingImages: [
      { id: 1, src: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=500', status: 'ok' },
      { id: 2, src: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=500', status: 'flagged' },
    ]
  }
];

export default function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
   const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showWarnOwnerModal, setShowWarnOwnerModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // FIND THE LISTING
  const listing = MOCK_DB.find(l => l.id === listingId) || MOCK_DB[0];
  const isPending = listing.status === 'Pending';

  // --- RENDER 1: PENDING REVIEW FORM ---
  if (isPending) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* --- HEADER ROW --- */}
<div className="flex items-center gap-4 mb-8">
  {/* ✅ PASTE THIS NEW CODE HERE */}
        <Link 
          href={reportId ? `/admin/reports/${reportId}` : "/admin/listings"} 
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
        >
          <IoMdArrowBack size={28} />  
        </Link>
  <h1 className="text-3xl font-bold text-[#002f34]">Review Pending Listing</h1>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Cloud Vision */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#8e1b1b] mb-2">Cloud Vision Detection</h3>
              <p className="text-[#c53030] font-medium">{listing.cloudReason}</p>
            </div>
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#002f34] mb-4">Listing Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {listing.pendingImages.map((img) => (
                  <div key={img.id} className={`relative rounded-lg overflow-hidden border-4 ${img.status === 'flagged' ? 'border-[#ff3547]' : 'border-[#00c851]'} h-64`}>
                    <img src={img.src} alt="Review" className="w-full h-full object-cover" />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded text-white text-xs font-bold uppercase ${img.status === 'flagged' ? 'bg-[#ff3547]' : 'bg-[#00c851]'}`}>
                      {img.status === 'flagged' ? 'Flagged' : 'Ok'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
           {/* 2. Listing Information */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  <h2 className="text-xl font-bold text-[#002f34] mb-6 border-b border-gray-100 pb-4">
    Listing Details
  </h2>

  {/* 2-Column Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* LEFT SIDE */}
    <div className="space-y-6">

      {/* Listing ID */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Listing ID</label>
        <p className="text-base font-medium text-[#002f34]">{listing.id}</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Category</label>
        <p className="text-base font-medium text-[#002f34]">{listing.category}</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Description</label>
        <p className="text-sm text-[#002f34] leading-relaxed">{listing.description}</p>
      </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="space-y-6">

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Title</label>
        <p className="text-base font-medium text-[#002f34]">{listing.title}</p>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Price</label>
        <p className="text-lg font-bold text-[#007bff]">{listing.price}</p>
      </div>

      {/* Date Created */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Upload Date </label>
        <p className="text-base font-medium text-[#002f34]">{listing.dateCreated}</p>
      </div>

    </div>

  </div>
</div>
</div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-bold text-[#002f34] mb-6">Review Actions</h2>
              <div className="space-y-3">
                <button
                onClick={() => setShowApproveModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00c851] hover:bg-[#007e33] text-white rounded-lg font-bold shadow-sm active:scale-95 transition-all">
                  <FiCheckCircle size={20} /> Approve Selected
                </button>
                <button
                onClick={() => setShowRejectModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold shadow-sm active:scale-95 transition-all">
                  <FiXCircle size={20} /> Reject Listing
                </button>
              </div>
            </div>
          </div>
           {showApproveModal && (
          // CHANGE: Increased z-index to z-[9999] and used bg-black/50 for better visibility
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#002f34]">Approve Listing</h3>
                <button 
                  onClick={() => setShowApproveModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Are you sure you want to approve "<span className="font-bold text-[#002f34]">{listing.title}</span>" 
                  with 1 selected image(s)? The listing will be published to the marketplace.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Listing Approved!');
                    setShowApproveModal(false);
                  }}
                  // Green styling
                  className="px-5 py-2.5 rounded-lg bg-[#00c851] text-white font-bold text-sm hover:bg-[#007e33] transition-colors shadow-sm"
                >
                  Approve Listing
                </button>
              </div>
            </div>
          </div>
        )}
        {showRejectModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
              
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#002f34]">Reject Listing</h3>
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Are you sure you want to reject "<span className="font-bold text-[#002f34]">{listing.title}</span>"? 
                  The listing will not be published and the owner will be notified.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Listing Rejected!');
                    setShowRejectModal(false);
                  }}
                  // Red styling to match your picture
                  className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828] transition-colors shadow-sm"
                >
                  Reject Listing
                </button>
              </div>

            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // --- RENDER 2: STANDARD DETAIL FORM (Active/Inactive) ---
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      
      {/* --- HEADER ROW --- */}
<div className="flex items-center gap-4 mb-8">
  <Link 
          href={reportId ? `/admin/reports/${reportId}` : "/admin/listings"} 
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
        >
    <IoMdArrowBack size={28} />  
  </Link>
  <h1 className="text-3xl font-bold text-[#002f34]">Listing Details</h1>
</div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Listing Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-4">Listing Images</h2>
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
              <img src={listing.imageUrl} alt="Listing" className="w-full h-full object-cover" />
            </div>
          </div>

         {/* 2. Listing Information */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  <h2 className="text-xl font-bold text-[#002f34] mb-6 border-b border-gray-100 pb-4">
    Listing Information
  </h2>

  {/* 2-Column Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* LEFT SIDE */}
    <div className="space-y-6">
      {/* Listing ID */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Listing ID</label>
        <p className="text-base font-medium text-[#002f34]">{listing.id}</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Category</label>
        <p className="text-base font-medium text-[#002f34]">{listing.category}</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Description</label>
        <p className="text-sm text-[#002f34] leading-relaxed">
          {listing.description}
        </p>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Title</label>
        <p className="text-base font-medium text-[#002f34]">{listing.title}</p>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Price</label>
        <p className="text-lg font-bold text-[#007bff]">{listing.price}</p>
      </div>

      {/* Date Created */}
      <div>
        <label className="block text-sm text-gray-500 mb-1">Date Created</label>
        <p className="text-base font-medium text-[#002f34]">{listing.dateCreated}</p>
      </div>
    </div>

  </div>
</div>

{/* 3. Owner Information */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  <h2 className="text-xl font-bold text-[#002f34] mb-6 border-b border-gray-100 pb-4">
    Owner Information
  </h2>

  {/* 2-Column Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* LEFT SIDE - Owner Name */}
    <div>
      <label className="block text-sm text-gray-500 mb-1">Owner Name</label>
      <p className="text-base font-medium text-[#002f34]">{listing.ownerName}</p>
    </div>

    {/* RIGHT SIDE - Owner ID */}
    <div>
      <label className="block text-sm text-gray-500 mb-1">Owner ID</label>
      <p className="text-base font-medium text-[#002f34]">{listing.ownerId}</p>
    </div>

  </div>
</div>

        </div>

        {/* RIGHT COLUMN: ACTIONS */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            <div className="space-y-3">
              
              {/* Remove Listing */}
              <button
              onClick={() => setShowRemoveModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiTrash2 size={18} />
                Remove Listing
              </button>

              {/* Warn Owner */}
              <button
              onClick={() => setShowWarnOwnerModal(true)}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiAlertTriangle size={18} />
                Warn Listing Owner
              </button>

              {/* Suspend Listing */}
              <button
              onClick={() => setShowSuspendModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiClock size={18} />
                Suspend Listing
              </button>

            </div>
          </div>
        </div>
       {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Remove Listing</h3>
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to remove "<span className="font-bold text-[#002f34]">{listing.title}</span>"? 
                This action cannot be undone.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Listing Removed!');
                  setShowRemoveModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828] transition-colors shadow-sm"
              >
                Remove Listing
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      {showWarnOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Warn Listing Owner</h3>
              <button 
                onClick={() => setShowWarnOwnerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to issue a warning to <span className="font-bold text-[#002f34]">{listing.ownerName}</span> about this listing? 
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowWarnOwnerModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Owner Warned!');
                  setShowWarnOwnerModal(false);
                }}
                // Yellow/Amber styling to match your picture
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
              <h3 className="text-lg font-bold text-[#002f34]">Suspend Listing</h3>
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
                Are you sure you want to suspend "<span className="font-bold text-[#002f34]">{listing.title}</span>"? 
                The listing will be hidden from the marketplace until reactivated.
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
                  alert('Listing Suspended!');
                  setShowSuspendModal(false);
                }}
                // Orange styling to match the Suspend theme
                className="px-5 py-2.5 rounded-lg bg-[#ff6b00] text-white font-bold text-sm hover:bg-[#e65100] transition-colors shadow-sm"
              >
                Suspend Listing
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}