"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { IoMdArrowBack } from 'react-icons/io';
import { FiImage } from 'react-icons/fi';

const USER_LISTINGS = [
  {
    id: 1,
    title: 'Professional DSLR Camera',
    category: 'Electronics',
    price: '$50/day',
    bg: 'bg-gray-800',
  },
  {
    id: 2,
    title: 'Vintage Mustang Car',
    category: 'Vehicles',
    price: '$300/day',
    bg: 'bg-gray-300',
  },
];

export default function UserListingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* --- HEADER ROW --- */}
      <div className="flex items-center gap-4 mb-8">
        {/* Back button goes back to the specific user's detail page */}
        <Link href={`/admin/users/${userId}`}>
          <IoMdArrowBack size={28} />
        </Link>
        <h1 className="text-3xl font-bold text-[#002f34]">User Listings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-[#002f34] mb-6">All items listed by {userId}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {USER_LISTINGS.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`h-40 w-full ${item.bg} flex items-center justify-center text-white/30 group-hover:scale-105 transition-transform duration-300`}>
                <FiImage size={48} />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#002f34] text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                <p className="text-[#007bff] font-bold text-base">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}