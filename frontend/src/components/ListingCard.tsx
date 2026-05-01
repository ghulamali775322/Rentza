"use client";
import Link from "next/link"; 

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

  // --- NEW LOGIC: Calculate how old the post is ---
  const calculateTimeAgo = (dateString: string) => {
    const postDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffInDays = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));

    if (diffInDays < 2) return "New";
    if (diffInDays === 2) return "2 days ago";
    if (diffInDays === 3) return "3 days ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "1 week ago";
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return "1 month+ ago";
  };

  const timeLabel = calculateTimeAgo(data.createdAt);

  return (
    <Link 
      href={`/listings/${data._id}`} 
      className="block"
      onClick={() => sessionStorage.setItem('homeScrollPos', window.scrollY.toString())}
    >
      <div className="border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white group cursor-pointer h-full flex flex-col">
        <div className="relative h-32 sm:h-40 w-full bg-gray-100 flex-shrink-0">
          <img 
            src={displayImage} 
            alt={data.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
              PKR {data.price.toLocaleString()} <span className="text-[10px] sm:text-xs font-normal text-gray-500">/ day</span>
            </h3>
            <p className="text-gray-600 text-sm mt-1 truncate">{data.title}</p>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
            <span className="truncate max-w-[70%]">{data.address}</span>
            {/* The hardcoded "New" has been replaced with the dynamic time label */}
            <span className={timeLabel === "New" ? "text-blue-600 font-bold" : ""}>
              {timeLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}