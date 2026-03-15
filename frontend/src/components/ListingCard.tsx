"use client";
import Image from "next/image";
import Link from "next/link"; // 1. Import Link
import { FiHeart } from "react-icons/fi";

interface ListingProps {
  data: {
    id: number;
    title: string;
    price: string;
    location: string;
    image: string;
  };
}

export default function ListingCard({ data }: ListingProps) {
  return (
    // 2. Wrap the card in a Link component pointing to your dynamic route
    // Make sure the path '/listing/' matches your folder name (e.g., app/listing/[id]/page.tsx)
    <Link href={`/listings/${data.id}`} className="block"> 
      
      <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white group cursor-pointer">
        <div className="relative h-40 w-full bg-gray-100">
          {/* Simple Image Placeholder */}
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Note: Putting a button inside a Link can cause hydration errors. 
              Ideally, use e.preventDefault() on the heart click to stop navigation. */}
          <button 
            onClick={(e) => {
              e.preventDefault(); // Prevents the card click from firing when clicking heart
              // Add wishlisting logic here
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
              <FiHeart />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-lg text-gray-900">{data.price}</h3>
          <p className="text-gray-600 text-sm mt-1 truncate">{data.title}</p>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
            <span>{data.location}</span>
            <span>Today</span>
          </div>
        </div>
      </div>

    </Link>
  );
}