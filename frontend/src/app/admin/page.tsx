"use client";

import React from 'react';
import { FiUsers, FiPackage, FiAlertCircle, FiUserCheck,FiClock } from 'react-icons/fi';
import { LuPackageCheck } from "react-icons/lu";

export default function AdminDashboard() {
const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const statsData = [
    { title: 'Total Users', value: '12,458', icon: FiUsers, color: '#007bff', bgColor: '#e6f2ff' }, // Blue
    { title: 'Active Users', value: '9,342', icon: FiUserCheck, color: '#00c851', bgColor: '#e6f9ec' }, // Green
    { title: 'Total Listings', value: '8,765', icon: FiPackage, color: '#8e44ad', bgColor: '#f3e5f5' }, // Purple
    { title: 'Active Listings', value: '6,543', icon: LuPackageCheck, color: '#6c5ce7', bgColor: '#ede7f6' }, // Deep Purple
    { title: 'Pending Listings', value: '24', icon: FiClock, color: '#ff8800', bgColor: '#fff3e0' }, // Orange
    { title: 'Pending Reports', value: '18', icon: FiAlertCircle, color: '#ff3547', bgColor: '#ffebee' }, // Red
  ];

  return (
    <div className="w-full">
      {/* --- STATS GRID --- */}
      {/* grid-cols-1: Mobile (1 per row) */}
      {/* md:grid-cols-2: Tablet (2 per row) */}
      {/* lg:grid-cols-3: Desktop (3 per row) -> This creates the 3x2 layout you requested */}
      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {statsData.map((stat, index) => (
          <div 
            key={index}
            // 1. Add Mouse Events for Hover State
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            
            // 2. Card Styles
            className="bg-white px-6 h-[180px] rounded-xl border border-gray-100 flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer"
            
            // 3. Dynamic Border Color on Hover
            style={{
              borderColor: hoveredIndex === index ? stat.color : '#f3f4f6', // #f3f4f6 is gray-100
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            {/* Left Side: Text Info */}
            <div>
              <h4 className="text-sm text-gray-500 font-medium mb-1">{stat.title}</h4>
              <h2 className="text-3xl font-bold text-[#002f34]">{stat.value}</h2>
            </div>
            
            {/* Right Side: Icon Box */}
            {/* 4. CHANGED: Solid Color Background & White Icon */}
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-md"
              style={{ 
                backgroundColor: stat.color, // Solid color from data
                // Removed 'color: stat.color' so icon stays white
              }}
            >
              <stat.icon />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}