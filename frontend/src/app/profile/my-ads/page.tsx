"use client";

import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

// --- DATA ---
const AD_FILTERS = [
  { key: 'active', label: 'Active Ads', count: 5 },
  { key: 'remove', label: 'Remove Ads', count: 3 },
];

// --- COMPONENT ---
export default function MyAdsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // In a real app, this would trigger an API call to filter results
  };

  // Helper class strings for reuse
  const tabButtonBase = "border rounded-[20px] py-2 px-[15px] text-sm font-semibold cursor-pointer transition-all duration-200";
  const tabButtonActive = "bg-[#007bff] text-white border-[#007bff] hover:bg-[#0056b3]";
  const tabButtonInactive = "bg-white text-[#002f34] border-[#ddd] hover:bg-[#f0f0f0]";

  return (
    // AdsContainer: max-w-1200px, margin auto, padding 40px 20px, min-h-screen, pt-30px
    <div className="max-w-[1200px] mx-auto py-10 px-5 min-h-screen pt-[30px]">
      
      {/* HeaderWrapper: border-bottom, padding-bottom 25px, margin-bottom 30px */}
      <div className="border-b border-[#eee] pb-[25px] mb-[30px]">
        
        {/* ProfileIndicator */}
        <div className="text-[15px] text-[#888] no-underline mb-[5px] block">
          Profile
        </div> 
        
        {/* PageHeader */}
        <h1 className="text-[32px] font-bold text-[#002f34] mb-[25px]">
          Manage and view your Ads
        </h1>
        
        {/* SearchBox: flex, align-center, max-w-500, mb-20, border, rounded, bg-white, transition */}
        <div className="flex items-center max-w-[500px] mb-5 border border-[#ddd] rounded-md bg-white transition-all duration-200 hover:border-[#007bff] ">
          <FiSearch size={22} className="ml-[15px] text-black" />
          
          {/* SearchInput */}
          <input 
            type="text"
            placeholder="Search by Ad Title"
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow py-[10px] px-[15px] border-none outline-none text-[15px] text-[#333] bg-transparent"
          />
        </div>
        
        {/* FilterTabs */}
        <div className="flex gap-[15px] flex-wrap">
          {AD_FILTERS.map((filter) => (
            <button 
              key={filter.key} 
              onClick={() => setActiveFilter(filter.key)}
              className={`${tabButtonBase} ${activeFilter === filter.key ? tabButtonActive : tabButtonInactive}`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* LISTING AREA (Placeholder) */}
      <div className="mt-10">
        <h3 className="text-[18px] font-bold mb-5 text-[#002f34]">
          {AD_FILTERS.find(f => f.key === activeFilter)?.label} Listings
        </h3>
        
        {/* Placeholder Card Grid */}
        {Array.from({ length: 3 }).map((_, i) => (
          // AdCardPlaceholder
          <div 
            key={i}
            className="bg-white border border-[#ddd] rounded-md p-[15px] mb-[15px] h-[100px] flex items-center text-[#555] italic"
          >
            Placeholder Listing Card #{i + 1}
          </div>
        ))}
      </div>
      
    </div>
  );
}