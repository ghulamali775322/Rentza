"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import hook
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiEdit2 } from 'react-icons/fi';

export default function AdminTopbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Define titles for each path
  const pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Users',
    '/admin/listings': 'Listings',
    '/admin/reports': 'Reports',
    '/admin/analytics': 'Analytics',
    '/admin/profile/edit': 'Edit Profile',
    '/admin/profile/settings': 'Settings'
  };

  // Get the title for the current path, or default to 'Admin Panel'
  const displayTitle = pageTitles[pathname] || 'Dashboard';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (
  /^\/admin\/users\/[^/]+\/?$/.test(pathname) ||
  /^\/admin\/listings\/[^/]+\/?$/.test(pathname)||
   /^\/admin\/reports\/[^/]+\/?$/.test(pathname)
) {
  return null;
}

  return (
    <header className="h-[90px] bg-[#f2f7ff] border-b border-[#eee] flex items-center justify-between px-10 w-[calc(100vw-260px)] ml-auto">

      
      {/* --- DYNAMIC PAGE TITLE --- */}
      <h2 className="text-2xl font-bold text-[#002f34]">
        {displayTitle}
      </h2>

      {/* --- PROFILE DROPDOWN AREA --- */}
      <div className="relative" ref={dropdownRef}>
        
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white shadow-md transition-transform hover:scale-105">
            <FiUser size={20} />
          </div>
          <FiChevronDown className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-14 w-56 bg-white border border-[#eee] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-3 border-b border-[#f5f5f5] mb-1">
              <p className="text-sm font-bold text-[#002f34]">Admin User</p>
              <p className="text-xs text-gray-500">admin@rentza.com</p>
            </div>

            <Link 
              href="/admin/profile/edit" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f9fa] hover:text-[#007bff] transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FiEdit2 size={16} /> Edit Profile
            </Link>

            <Link 
              href="/admin/profile/settings" 
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f9fa] hover:text-[#007bff] transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FiSettings size={16} /> Settings
            </Link>

            <div className="my-1 border-t border-[#f5f5f5]"></div>

            <button 
              onClick={() => {
                console.log("Logging out..."); 
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>

    </header>
  );
}