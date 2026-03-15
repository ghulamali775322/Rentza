"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiGrid,       // Dashboard icon
  FiUsers,      // Users icon
  FiPackage,    // Listings icon (Box)
  FiAlertCircle,// Reports icon
  FiBarChart2,  // Analytics icon
  FiFileText,   // Activity Logs icon
} from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();

  // Navigation Items Configuration based on your image
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FiGrid },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Listings', href: '/admin/listings', icon: FiPackage },
    { name: 'Reports', href: '/admin/reports', icon: FiAlertCircle },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
  ];

  return (
    // Sidebar Container
    // Matches the dark navy background from the image
    <aside className="h-screen w-64 bg-[#0b1120] text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 max-md:hidden font-sans">
      
      {/* --- HEADER AREA --- */}
      {/* "Admin Panel" text with a subtle border below it */}
      <div className="h-[90px] flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-wide">
         Rentza  Admin Panel
        </h1>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`
                    flex items-center gap-3.5 px-4 py-3 rounded-lg transition-all duration-200 text-[18px] font-medium
                    ${isActive 
                      ? 'bg-[#1d4ed8] text-white shadow-md' // Active: Bright Blue background
                      : 'text-white hover:bg-white/10' // Inactive: Grey text, slight hover bg
                    }
                  `}
                >
                  {/* Icon sizing and color */}
                  <item.icon className={`text-[20px] ${isActive ? 'text-white' : 'text-white'} group-hover:text-white'}`} />
                  
                  {/* Label */}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}