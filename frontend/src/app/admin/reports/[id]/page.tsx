"use client";

import React, { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiFileText,
  FiSlash,
  FiXCircle
} from 'react-icons/fi';

// --- MOCK DATA (Only 3 reports for your frontend prototype) ---
const MOCK_REPORTS = [
  {
    id: 'R001', // We will make this one act like PENDING
    date: '2024-11-24',
    reason: 'Misleading description',
    description: 'The listing claims the camera is in excellent condition, but it has scratches.',
    reportingUser: { name: 'Jane Cooper', id: 'U010' },
    reportedItem: { name: 'Professional DSLR Camera', id: 'L001' },
  },
  {
    id: 'R002', // We will make this one act like RESOLVED
    date: '2024-11-20',
    reason: 'Fake item',
    description: 'This is a scam listing using stock photos.',
    reportingUser: { name: 'Alex Turner', id: 'U006' },
    reportedItem: { name: 'Gaming Laptop', id: 'L004' },
  },
  {
    id: 'R003', // We will make this one act like DISMISSED
    date: '2024-11-19',
    reason: 'Spam messaging',
    description: 'User is sending promotional spam to others.',
    reportingUser: { name: 'Sarah Johnson', id: 'U002' },
    reportedItem: { name: 'John Smith', id: 'U001' },
  }
];

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
const reportId = resolvedParams.id;

const router = useRouter();
const searchParams = useSearchParams();
const tab = searchParams.get("tab") || "Pending";
  // MODALS STATE
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showReviewLaterModal, setShowReviewLaterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [showSuspendOwnerModal, setShowSuspendOwnerModal] = useState(false);
  const [showDeleteListingModal, setShowDeleteListingModal] = useState(false);

  // Find the report corresponding to the ID
  const report = MOCK_REPORTS.find(r => r.id === reportId) || MOCK_REPORTS[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      
      {/* --- HEADER ROW --- */}
      <div className="flex items-center gap-4 mb-8">
       <button
  onClick={() => router.push(`/admin/reports?tab=${tab}`)}
  className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
>
  <IoMdArrowBack size={28} />
</button>
        <h1 className="text-3xl font-bold text-[#002f34]">Report Details</h1>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN (Report Info) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-[#002f34] mb-6">Report Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Report ID</label>
                <p className="text-base font-medium text-[#002f34]">{report.id}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Report Date</label>
                <p className="text-base font-medium text-[#002f34]">{report.date}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Reason</label>
                <p className="text-base font-medium text-[#002f34]">{report.reason}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-black-100">
              <h3 className="text-sm font-bold text-black-400 uppercase tracking-wider mb-4">Full Description</h3>
              <p className="text-[#002f34] leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Actions Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">Actions</h2>
            
            
            {tab === 'Pending' && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <button onClick={() => setShowSuspendOwnerModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff6b00] hover:bg-[#e65100] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                  <FiSlash size={18} /> Suspend Owner
                </button>
                <button onClick={() => setShowReviewLaterModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                  <FiFileText size={18} /> Review Later
                </button>
                <button onClick={() => setShowDismissModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6c757d] hover:bg-[#5a6268] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                  <FiXCircle size={18} /> Dismiss Report
                </button>
                <button onClick={() => setShowDeleteListingModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                  <FiTrash2 size={18} /> Delete Listing
                </button>
              </div>
            )}

            {/* 👇 IF ID IS R002 OR R003 (Pretend it's Resolved/Dismissed): Show 1 button 👇 */}
           {(tab === 'Resolved' || tab === 'Dismissed') && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff3547] hover:bg-[#c62828] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95">
                  <FiTrash2 size={18} /> Delete Report
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* --- ALL YOUR MODALS --- */}
      {showDismissModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Dismiss Report</h3>
              <button onClick={() => setShowDismissModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">Are you sure you want to dismiss this report? No action will be taken.</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowDismissModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { alert('Report Dismissed!'); setShowDismissModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#6c757d] text-white font-bold text-sm hover:bg-[#5a6268] transition-colors shadow-sm">Dismiss Report</button>
            </div>
          </div>
        </div>
      )}

      {showReviewLaterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Review Later</h3>
              <button onClick={() => setShowReviewLaterModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">This report will remain pending for future review.</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowReviewLaterModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { alert('Marked for Future Review'); setShowReviewLaterModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#007bff] text-white font-bold text-sm hover:bg-[#0056b3] transition-colors shadow-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSuspendOwnerModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Suspend Owner</h3>
              <button onClick={() => setShowSuspendOwnerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">Are you sure you want to suspend the user associated with this report? They will lose access to their account.</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowSuspendOwnerModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { alert('Owner Suspended!'); setShowSuspendOwnerModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#ff6b00] text-white font-bold text-sm hover:bg-[#e65100] transition-colors shadow-sm">Suspend Owner</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteListingModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Delete Listing</h3>
              <button onClick={() => setShowDeleteListingModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">Are you sure you want to permanently delete this listing? This action cannot be undone.</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteListingModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { alert('Listing Deleted!'); setShowDeleteListingModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828] transition-colors shadow-sm">Delete Listing</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#002f34]">Delete Report</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={20} /></button>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-600 text-sm leading-relaxed">Are you sure you want to permanently delete this report record? This action cannot be undone.</p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { alert('Report Deleted!'); setShowDeleteModal(false); }} className="px-5 py-2.5 rounded-lg bg-[#ff3547] text-white font-bold text-sm hover:bg-[#c62828] transition-colors shadow-sm">Delete Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}