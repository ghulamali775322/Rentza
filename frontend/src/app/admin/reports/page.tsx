"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiEye } from 'react-icons/fi';

// --- TYPES (Status property removed) ---
interface Report {
  id: string;
  reportedBy: string;
  reportedAgainst: string;
  reason: string;
  evidenceCount: number;
  date: string;
}

// --- MOCK DATA (Divided into 3 separate lists) ---

const PENDING_REPORTS: Report[] = [
  { 
    id: 'R001', reportedBy: 'Jane Cooper', reportedAgainst: 'Professional DSLR Camera (L001)', 
    reason: 'Misleading description', evidenceCount: 1, date: '2024-11-24' 
  },
  { 
    id: 'R002', reportedBy: 'Tom Anderson', reportedAgainst: 'Michael Brown (U003)', 
    reason: 'Harassment and inappropriate behavior', evidenceCount: 0, date: '2024-11-23' 
  }
];

const RESOLVED_REPORTS: Report[] = [
  { 
    id: 'R005', reportedBy: 'Alex Turner', reportedAgainst: 'Gaming Laptop (L004)', 
    reason: 'Fake item', evidenceCount: 1, date: '2024-11-20' 
  }
];

const DISMISSED_REPORTS: Report[] = [
  { 
    id: 'R006', reportedBy: 'Sarah Johnson', reportedAgainst: 'John Smith (U001)', 
    reason: 'Spam messaging', evidenceCount: 3, date: '2024-11-19' 
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'Resolved' | 'Pending' | 'Dismissed'>('Resolved');
  const [searchTerm, setSearchTerm] = useState('');

  // 👇 FIXED: Logic to pick the data based on tab without using .status
  const getActiveData = (): Report[] => {
    if (activeTab === 'Pending') return PENDING_REPORTS;
    if (activeTab === 'Resolved') return RESOLVED_REPORTS;
    if (activeTab === 'Dismissed') return DISMISSED_REPORTS;
    return [];
  };

  const currentData = getActiveData();

  // Filter based on search term
  const filteredReports = currentData.filter(report => 
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedAgainst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4">
      
      {/* --- TABS --- */}
      <div className="flex items-center gap-4 mb-8">
        {['Resolved', 'Pending', 'Dismissed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-44 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
              ${activeTab === tab 
                ? 'bg-[#1d4ed8] text-white border border-[#1d4ed8]' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {tab} Reports
          </button>
        ))}
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <div className="relative w-120 max-w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:border-[#007bff] sm:text-sm"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- REPORTS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reported Against</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.reportedBy}</td>
                  <td className="px-6 py-4 whitespace-normal max-w-[200px] text-sm font-medium text-[#002f34]">{report.reportedAgainst}</td>
                  <td className="px-6 py-4 whitespace-normal max-w-[200px] text-sm text-gray-600">{report.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{report.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/reports/${report.id}?tab=${activeTab}`}>
                      <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ml-auto w-[140px]">
                        <FiEye size={16} />
                        <span className="font-semibold whitespace-nowrap">View Details</span>
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}