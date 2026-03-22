"use client";
import Link from "next/link"; 
import { FiHeart } from "react-icons/fi";

interface ListingProps {
  data: {
    _id: string;           // Backend uses _id
    title: string;
    price: number;         // Backend uses a Number
    address: string;       // Backend uses address
    images: { url: string, status: string }[]; // Backend uses an array of images
    createdAt: string;     // Backend timestamps
  };
}

export default function ListingCard({ data }: ListingProps) {
  // Grab the first approved image, or show a gray placeholder if none exists
  const displayImage = data.images && data.images.length > 0 
    ? `http://localhost:5000${data.images[0].url}` 
    : "https://via.placeholder.com/300?text=No+Image";

  return (
    <Link href={`/listings/${data._id}`} className="block"> 
      <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white group cursor-pointer h-full flex flex-col">
        <div className="relative h-40 w-full bg-gray-100 flex-shrink-0">
          <img 
            src={displayImage} 
            alt={data.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={(e) => {
              e.preventDefault(); 
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
              <FiHeart />
          </button>
        </div>
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              PKR {data.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ day</span>
            </h3>
            <p className="text-gray-600 text-sm mt-1 truncate">{data.title}</p>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
            <span className="truncate max-w-[70%]">{data.address}</span>
            <span>New</span>
          </div>
        </div>
      </div>
    </Link>
  );
}