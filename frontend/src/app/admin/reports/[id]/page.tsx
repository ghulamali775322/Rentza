"use client";

import React, { use,useState } from 'react';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { 
  FiAlertTriangle, 
  FiClock, 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiFileText,
  FiUser,
  FiSlash,
  FiXCircle
} from 'react-icons/fi';

// --- MOCK DATA ---
// In a real app, you would fetch this data based on the 'id' param.
const MOCK_REPORTS = [
  // 1. LISTING REPORT EXAMPLE
  {
    id: 'R001',
    type: 'Listing',
    status: 'Pending',
    date: '2024-11-24',
    reason: 'Misleading description',
    description: 'The listing claims the camera is in excellent condition, but when I rented it, there were scratches on the lens and the battery was defective.',
    reportingUser: {
      name: 'Jane Cooper',
      id: 'U010'
    },
    reportedItem: {
      type: 'Listing',
      name: 'Professional DSLR Camera',
      id: 'L001'
    },
    evidenceFiles: 1
  },
  // 2. USER REPORT EXAMPLE (To test the conditional logic)
  {
    id: 'R002',
    type: 'User',
    status: 'Pending',
    date: '2024-11-23',
    reason: 'Harassment and inappropriate behavior',
    description: 'This user kept sending me abusive messages after I declined their rental request. Screenshots attached.',
    reportingUser: {
      name: 'Tom Anderson',
      id: 'U012'
    },
    reportedItem: {
      type: 'User',
      name: 'Michael Brown',
      id: 'U003'
    },
    evidenceFiles: 0
  },
  {
    id: 'R004',
    type: 'User',
    status: 'Pending',
    date: '2024-11-24',
    reason: 'Misleading description',
    description: 'The listing claims the camera is in excellent condition, but when I rented it, there were scratches on the lens and the battery was defective.',
    reportingUser: {
      name: 'Jane Cooper',
      id: 'U010'
    },
    reportedItem: {
      type: 'Listing',
      name: 'Jhon Smith',
      id: 'U001'
    },
  },
];

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() for Next.js 15+
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showReviewLaterModal, setShowReviewLaterModal] = useState(false);

  // Find the report corresponding to the ID
  // Default to the first one if not found for demo purposes
  const report = MOCK_REPORTS.find(r => r.id === reportId) || MOCK_REPORTS[0];
  const isListingReport = report.type === 'Listing';

  // --- STATUS BADGE HELPER ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
      case 'Resolved': return <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">Resolved</span>;
      case 'Dismissed': return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">Dismissed</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      
      {/* --- HEADER ROW  --- */}
<div className="flex items-center gap-4 mb-8">
  <Link 
    href="/admin/reports" 
    className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
  >
    <IoMdArrowBack size={28} />
  </Link>

  <h1 className="text-3xl font-bold text-[#002f34]">Report Details</h1>
</div>


      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN (Report Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Report Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#002f34] mb-6">Report Overview</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Report ID</label>
                <p className="text-base font-medium text-[#002f34]">{report.id}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Type</label>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                  ${isListingReport ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                  {report.type}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Report Date</label>
                <p className="text-base font-medium text-[#002f34]">{report.date}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                {getStatusBadge(report.status)}
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Reason</label>
                <p className="text-base font-medium text-[#002f34]">{report.reason}</p>
              </div>
            </div>
          </div>

          {/* 2. Reporting User Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#002f34] mb-6">Reporting User</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <p className="text-base font-medium text-[#002f34]">{report.reportingUser.name}</p>
              </div>
              <div>
                 <label className="block text-sm text-gray-500 mb-1">User ID</label>
                 <Link href={`/admin/users/${report.reportingUser.id}?from=reports`} className="text-blue-600 hover:underline font-medium">
                  {report.reportingUser.id}
                 </Link>
            </div>
            </div>
          </div>

          {/* 3. Reported Entity Card (Conditional Title) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#002f34] mb-6">
              {isListingReport ? 'Reported Listing' : 'Reported User'}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  {isListingReport ? 'Listing Title' : 'User Name'}
                </label>
                <p className="text-base font-bold text-[#002f34]">{report.reportedItem.name}</p>
              </div>
              <div>
                 <label className="block text-sm text-gray-500 mb-1">ID</label>
                 {/* Link to either listing details or user details based on type */}
                 <Link 
  href={isListingReport 
    // We send the 'report.id' so the next page knows EXACTLY which report to go back to
    ? `/admin/listings/${report.reportedItem.id}?reportId=${report.id}` 
    : `/admin/users/${report.reportedItem.id}?reportId=${report.id}`
  }
            className="text-blue-600 hover:underline font-medium"
                  >
             {report.reportedItem.id}
      </Link>

              </div>
            </div>
          </div>

           {/* 4. Full Description Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-[#002f34] mb-4">Full Description</h2>
            <p className="text-[#002f34] leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN (Actions Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            {/* --- COMMON REPORT ACTIONS (Always visible) --- */}
            <div className="space-y-3 pt-6 border-t border-gray-100">
               {/* Dismiss (Gray) */}
               <button
               onClick={() => setShowDismissModal(true)}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6c757d] hover:bg-[#5a6268] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiXCircle size={18} /> Dismiss Report
              </button>
              {/* Mark as Resolved (Green) */}
              <button
              onClick={() => setShowResolveModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00c851] hover:bg-[#007e33] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiCheckCircle size={18} /> Mark as Resolved
              </button>
              {/* Review Later (Blue) */}
              <button
              onClick={() => setShowReviewLaterModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                <FiFileText size={18} /> Review Later
              </button>
            </div>

          </div>
        </div>

      </div>
      {showDismissModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Dismiss Report</h3>
              <button 
                onClick={() => setShowDismissModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to dismiss this report? No action will be taken.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDismissModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Report Dismissed!');
                  setShowDismissModal(false);
                }}
                // Grey styling to match your picture
                className="px-5 py-2.5 rounded-lg bg-[#6c757d] text-white font-bold text-sm hover:bg-[#5a6268] transition-colors shadow-sm"
              >
                Dismiss Report
              </button>
            </div>

          </div>
        </div>
      )}
      {showResolveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Mark as Resolved</h3>
              <button 
                onClick={() => setShowResolveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Are you sure you want to mark this report as <span className="font-bold text-[#00c851]">Resolved</span>? 
                This indicates that necessary actions have been taken and the case is closed.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Report Resolved!');
                  setShowResolveModal(false);
                }}
                // Green styling to match the Resolved status
                className="px-5 py-2.5 rounded-lg bg-[#00c851] text-white font-bold text-sm hover:bg-[#007e33] transition-colors shadow-sm"
              >
                Mark Resolved
              </button>
            </div>

          </div>
        </div>
      )}
      {showReviewLaterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Review Later</h3>
              <button 
                onClick={() => setShowReviewLaterModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} /> 
                {/* Make sure FiX is imported from 'react-icons/fi' at the top */}
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                This report will remain pending for future review.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewLaterModal(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Marked for Future Review');
                  setShowReviewLaterModal(false);
                }}
                // Blue styling to match the button theme
                className="px-5 py-2.5 rounded-lg bg-[#007bff] text-white font-bold text-sm hover:bg-[#0056b3] transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}