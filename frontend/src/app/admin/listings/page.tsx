"use client";
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiEye } from 'react-icons/fi';

// --- TYPES ---
// Updated to support both Standard and Pending data fields
interface Listing {
  id: string;
  title: string;
  category: string; // Used for Active/Inactive
  owner: string;
  price: string;    // Used for Active/Inactive
  // Specific fields for Pending View (from your image)
  imageCount?: number;
  cloudReason?: string;
  date?: string;
}

// --- MOCK DATA ---
const ACTIVE_LISTINGS: Listing[] = [
  { id: 'L001', title: 'Professional DSLR Camera', category: 'Electronics', owner: 'John Smith', price: '1500/day' },
  { id: 'L004', title: 'Gaming Laptop', category: 'Electronics', owner: 'Emily Davis', price: '2000/day' }
];

const INACTIVE_LISTINGS: Listing[] = [
  { id: 'L002', title: 'Mountain Bike - Trek', category: 'Sports', owner: 'Sarah Johnson', price: '3000/day' }
];

const PENDING_LISTINGS: Listing[] = [
  {
    id: 'P001',
    title: 'Gaming Console Bundle',
    category: 'Electronics',
    owner: 'Alex Turner',
    price: '-',
    imageCount: 2,
    date: '2024-11-20',
    cloudReason: 'Possible violence in game imagery'
  }
];

export default function ListingsPage() {
  const searchParams = useSearchParams();
const initialTab = (searchParams.get('tab') as 'Active' | 'Inactive' | 'Pending') || 'Active';
const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  let listings: Listing[] = [];

if (activeTab === 'Active') listings = ACTIVE_LISTINGS;
if (activeTab === 'Inactive') listings = INACTIVE_LISTINGS;
if (activeTab === 'Pending') listings = PENDING_LISTINGS;

  const filteredListings = listings.filter(listing => {
  return (
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );
});
  return (
    <div className="w-full">
      
      {/* --- TABS --- */}
      <div className="flex items-center gap-4 mb-8">
  {['Active', 'Inactive', 'Pending'].map((tab) => (
    <button 
      key={tab}
      onClick={() => setActiveTab(tab as any)}
      className={`w-40 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
        ${activeTab === tab 
          ? 'bg-[#1d4ed8] text-white border border-[#1d4ed8]' 
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
    >
      {tab} Listings
    </button>
        ))}
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <div className="relative w-120 max-w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500 text-lg" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#007bff] sm:text-sm"
            placeholder="Search by title, category, owner, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          
            <thead className="bg-[#f8f9fa]">
              {activeTab === 'Pending' ? (
                // --- PENDING HEADERS 
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Image Metadata</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Listing Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Uploaded By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Cloud Vision Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">Action</th>
                </tr>
              ) : (
                // --- ACTIVE / INACTIVE HEADERS ---
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Listing ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#002f34] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#002f34] uppercase tracking-wider">Actions</th>
                </tr>
              )}
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* --- PENDING ROWS --- */}
                  {activeTab === 'Pending' ? (
                    <>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                         {listing.imageCount} image(s)
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#002f34]">
                         {listing.title}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                         {listing.owner}
                       </td>
                       <td className="px-6 py-4">
                         {/* Red/Pink Badge for Cloud Vision Reason */}
                         <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-1 rounded border border-red-100 max-w-[200px] leading-tight">
                           {listing.cloudReason}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                         {listing.date}
                       </td>
                    </>
                  ) : (
                    // --- ACTIVE / INACTIVE ROWS ---
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{listing.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#002f34]">{listing.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{listing.owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#002f34]">{listing.price}</td>
                    </>
                  )}

                 {/* Actions Button Logic */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/listings/${listing.id}?tab=${activeTab}`}>
                      <button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm ml-auto w-[140px]">
                        <FiEye size={16} />
                        
                        {/* CONDITIONAL TEXT: If Pending, say "Review", else "View Details" */}
                        <span className="font-semibold whitespace-nowrap">
                          {activeTab === 'Pending' ? 'Review' : 'View Details'}
                        </span>
                        
                      </button>
                    </Link>
                  </td>

                </tr>
              ))}
              
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No {activeTab.toLowerCase()} listings found.
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