"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiEye, FiFileText } from 'react-icons/fi';

// --- TYPES ---
interface Report {
  id: string;
  type: 'Listing' | 'User';
  reportedBy: string;
  reportedAgainst: string; // Name + (ID)
  reason: string;
  evidenceCount: number; // 0 means "None"
  status: 'Pending' | 'Resolved' | 'Dismissed';
  date: string;
}

// --- MOCK DATA (Matches your image) ---
const REPORTS_DATA: Report[] = [
  { 
    id: 'R001', 
    type: 'Listing', 
    reportedBy: 'Jane Cooper', 
    reportedAgainst: 'Professional DSLR Camera (L001)', 
    reason: 'Misleading description', 
    evidenceCount: 1, 
    status: 'Pending', 
    date: '2024-11-24' 
  },
  { 
    id: 'R002', 
    type: 'User', 
    reportedBy: 'Tom Anderson', 
    reportedAgainst: 'Michael Brown (U003)', 
    reason: 'Harassment and inappropriate behavior', 
    evidenceCount: 0, 
    status: 'Pending', 
    date: '2024-11-23' 
  },
  { 
    id: 'R003', 
    type: 'Listing', 
    reportedBy: 'Emily Davis', 
    reportedAgainst: 'Mountain Bike (L002)', 
    reason: 'Item not as described', 
    evidenceCount: 2, 
    status: 'Pending', 
    date: '2024-11-22' 
  },
  { 
    id: 'R004', 
    type: 'User', 
    reportedBy: 'Emily Davis', 
    reportedAgainst: 'Mountain Bike (L002)', 
    reason: 'Item not as described', 
    evidenceCount: 2, 
    status: 'Pending', 
    date: '2024-11-22' 
  },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic
  const filteredReports = REPORTS_DATA.filter(report => 
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportedAgainst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 ...">
      
      {/* --- TITLE --- */}
      {/* Based on your other pages, title is usually managed by Topbar, 
          but if you want it here like the image 'Reports', uncomment below */}
      {/* <h1 className="text-2xl font-bold text-[#002f34] mb-6">Reports</h1> */}

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <div className="relative w-120 max-w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[#007bff] sm:text-sm"
            placeholder="Search by report ID, reporter, reported against, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- REPORTS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            
            {/* Header */}
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reported Against</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {report.id}
                  </td>

                  {/* Type Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${report.type === 'Listing' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                      {report.type}
                    </span>
                  </td>

                  {/* Reported By */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {report.reportedBy}
                  </td>

                  {/* Reported Against */}
                  <td className="px-6 py-4 whitespace-normal max-w-[200px]">
                    <div className="text-sm font-medium text-[#002f34] leading-tight">
                      {report.reportedAgainst}
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4 whitespace-normal max-w-[200px] text-sm text-gray-600 leading-tight">
                    {report.reason}
                  </td>
                  {/* Status Badge (Pending = Yellow/Orange) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      {report.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {report.date}
                  </td>

                  {/* Action Button */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* You will need a dynamic route like /admin/reports/[id] for this link */}
                    <Link href={`/admin/reports/${report.id}`}>
                      <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[140px]">
                        <FiEye size={16} />
                        <span className="font-semibold whitespace-nowrap">View Details</span>
                      </button>
                    </Link>
                  </td>

                </tr>
              ))}

              {/* Empty State */}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                    No reports found.
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