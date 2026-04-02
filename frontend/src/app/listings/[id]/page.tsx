"use client";
import ListingMap from "@/components/ListingMap";
import ReportModal from "@/components/modals/ReportModal";
import React, { use, useState, useEffect } from "react"; 
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { 
  FiMapPin, 
  FiCalendar, 
  FiShare2, 
  FiHeart, 
  FiPhone, 
  FiMessageCircle,
  FiFlag,
  FiUser,
  FiChevronRight,
  FiFileText,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";

// 1. IMPORT TOAST AND CONFIRM MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id; 
  const router = useRouter();

  // --- AUTHENTICATION STATE ---
  const { data: session } = useSession();
  const { name } = useAuth();
  
  // --- NEW: STATE TO HOLD MONGODB ID ---
  const [myMongoId, setMyMongoId] = useState<string | null>(null);

  // --- STATE FOR REAL DATA ---
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- UI STATE ---
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 

  // 2. MODAL STATES
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- 1. GET USER ID ---
  useEffect(() => {
    const fetchUserId = async () => {
      let currentId = (session?.user as any)?.id || (session?.user as any)?._id;
      const localToken = localStorage.getItem("token");
      
      if (!currentId && localToken) {
        try {
          const payload = JSON.parse(atob(localToken.split(".")[1]));
          currentId = payload._id || payload.id || payload.userId;
        } catch (e) {}
      }

      if (!currentId && (localToken || session?.user?.email)) {
        try {
          const headers: HeadersInit = {};
          if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
          else if (session?.user?.email) headers["x-google-email"] = session?.user?.email;
          const profileRes = await fetch("http://localhost:5000/profile", { headers });
          const profileData = await profileRes.json();
          currentId = profileData?.user?._id;
        } catch (e) {}
      }

      if (currentId) setMyMongoId(currentId);
    };

    fetchUserId();
  }, [session]);

  // --- 2. FETCH LISTING DATA ---
  useEffect(() => {
    const fetchSingleListing = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/listings/${id}`);
        const result = await response.json();
        
        if (result.success) {
          setListing(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load the listing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleListing();
  }, [id]);

  // --- DELETE HANDLER (Split into Open Modal & Execute) ---
  const confirmDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email; 

      const response = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE",
        headers: headers,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Ad deleted successfully!");
        router.replace("/profile/my-ads"); 
      } else {
        toast.error(result.message || "Failed to delete ad.");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("An error occurred while deleting the ad.");
    }
  };

  // --- SHARE HANDLER ---
  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareText = `Check out "${listing.title}" on Rentza!\n\n${currentUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `Check out "${listing.title}" on Rentza!\n\n`,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // --- PHONE HANDLER ---
  const handleShowPhoneClick = () => {
    const localToken = localStorage.getItem("token");
    if (!session && !localToken) {
      setIsLoginModalOpen(true); // Replaces alert + instant redirect
      return;
    }
    setShowPhone(true);
  };

  // --- CHAT HANDLER ---
  const handleChatClick = async () => {
    if (!myMongoId) {
      setIsLoginModalOpen(true); // Replaces alert + instant redirect
      return;
    }

    if (myMongoId === listing.lenderId?._id) {
      toast.error("You cannot chat with yourself!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: myMongoId, 
          receiverId: listing.lenderId?._id, 
          listingId: listing._id 
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/inbox?open=${data.data._id}`); 
      } else {
        toast.error("Could not start chat.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("An error occurred while starting the chat.");
    }
  };

  // --- REPORT HANDLER ---
  const handleReportClick = () => {
    const localToken = localStorage.getItem("token");
    
    if (!session && !localToken) {
      setIsLoginModalOpen(true); // Replaces alert + instant redirect
      return;
    }

    setIsReportOpen(true);
  };

  // THE FIX: Force the page to always open at the very top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[100px] flex justify-center">
        <p className="text-xl font-bold text-gray-500 animate-pulse">Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[100px] flex justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ad not found</h2>
          <p className="text-gray-500 mb-6">{error || "This listing may have been removed."}</p>
          <Link href="/" className="bg-[#002f34] text-white px-6 py-3 rounded-md hover:bg-[#004d55]">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  const postedDate = new Date(listing.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  // --- THE FIX: BULLETPROOF OWNER CHECK USING MONGODB ID ---
  const isOwner = myMongoId === listing.lenderId?._id;

  return (
    <div className="min-h-screen bg-gray-50 pt-[50px] pb-24 md:pb-10">
      
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-base text-gray-500 flex items-center">
          <Link href={`/search?category=${encodeURIComponent(listing.category)}`} className="hover:text-blue-600 mr-1">
            {listing.category}
          </Link> / 
          <span className="text-gray-700 ml-1 truncate">{listing.title}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
           <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center h-[250px] md:h-[400px] relative group">
              <img 
                src={listing.images && listing.images.length > 0 ? `http://localhost:5000${listing.images[activeImageIndex].url}` : "https://via.placeholder.com/600?text=No+Image"} 
                alt={listing.title} 
                className="h-full w-full object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-3 z-10">
                <button 
                  onClick={handleShare}
                  className="bg-white p-2.5 rounded-full shadow-md hover:bg-gray-100 transition cursor-pointer group"
                  title="Share this ad"
                >
                  <FiShare2 size={20} className="text-gray-700 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>
            
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {listing.images.map((img: any, idx: number) => (
                  <img 
                    key={idx}
                    src={`http://localhost:5000${img.url}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-20 w-24 object-cover rounded cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    alt={`Thumbnail ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  PKR {listing.price.toLocaleString()} <span className="text-xl font-medium text-gray-500">/ day</span>
                </h1>
                <h2 className="text-xl text-gray-700 mt-2">{listing.title}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <FiMapPin /> {listing.address}
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar /> Posted on {postedDate}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <Link href={`/lender/${listing.lenderId?._id}`} className="block">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                 <div className="w-16 h-16 bg-[#002f34] rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold relative shrink-0 shadow-sm border border-gray-200">
                    {listing.lenderId?.profilePhotoPath ? (
                      <img 
                        src={`http://localhost:5000${listing.lenderId.profilePhotoPath}`} 
                        alt={listing.lenderId?.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      listing.lenderId?.name?.charAt(0).toUpperCase() || <FiUser size={32} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Posted by</p>
                    <h3 className="font-bold text-lg text-gray-900 capitalize">{listing.lenderId?.name || "Rentza User"}</h3>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 text-xl" />
              </div>
            </Link>

            <hr className="border-gray-100" />

            <div className="p-4 flex items-start gap-2">
               <div className="mt-1 text-blue-600"><FiFileText /></div>
               <div>
                  <p className="text-xs text-gray-500">Account Status</p>
                  <p className="font-bold text-green-600 text-sm">Verified User</p>
               </div>
            </div>
          </div>

         {/* --- MOBILE STICKY ACTION BAR (OLX STYLE) --- */}
          <div className="fixed bottom-0 left-0 w-full z-50 bg-white p-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex flex-row gap-3 md:relative md:bottom-auto md:left-auto md:w-auto md:border-t-0 md:shadow-none md:bg-transparent md:p-0 md:flex-col md:z-auto">
            
            {isOwner ? (
              <>
              {/* EDIT BUTTON (For Owner) */}
                <button 
                  onClick={() => router.push(`/edit-listing/${listing._id}`)}
                  className="flex-1 w-full border-2 border-[#002f34] text-[#002f34] bg-white font-bold py-2.5 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer text-[15px]"
                >
                  <FiEdit2 size={18} className="shrink-0" />
                  <span>Edit Ad</span>
                </button>

                {/* DELETE BUTTON (For Owner) */}
                <button 
                  onClick={confirmDelete}
                  className="flex-1 w-full font-bold py-2.5 rounded flex items-center justify-center gap-2 transition text-[15px] bg-red-600 text-white hover:bg-red-700"
                >
                  <FiTrash2 size={18} className="shrink-0" />
                  <span>Delete Ad</span>
                </button>
              </>
            ) : (
              <>
                {/* CHAT BUTTON (For Renters) */}
                <button 
                  onClick={handleChatClick}
                  className="flex-1 w-full border-2 border-[#002f34] text-[#002f34] bg-white font-bold py-2.5 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer text-[15px]"
                >
                  <FiMessageCircle size={18} className="shrink-0" />
                  <span>Chat</span>
                </button>

                {/* CALL BUTTON (For Renters) */}
                <button 
                  onClick={handleShowPhoneClick}
                  className="flex-1 w-full font-bold py-2.5 rounded flex items-center justify-center gap-2 transition text-[15px] bg-[#002f34] text-white hover:bg-[#004247]"
                >
                  <FiPhone size={18} className="shrink-0" />
                  <span className="truncate">{showPhone ? listing.contactNumber : "Call"}</span>
                </button>
              </>
            )}
          </div>

          {/* --- INTERACTIVE MAPBOX MAP --- */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Location</h3>
            <a 
              href={`https://www.google.com/maps?q=${listing.location?.coordinates[1]},${listing.location?.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm mb-3 w-fit transition-colors cursor-pointer"
              title="Open in Google Maps"
            >
              <FiMapPin size={18} className="shrink-0" />
              <span className="line-clamp-2">{listing.address}</span>
            </a>
            
            {listing.location?.coordinates && listing.location.coordinates.length === 2 ? (
              <div className="w-full overflow-hidden mt-3">
                <ListingMap 
                  longitude={listing.location.coordinates[0]} 
                  latitude={listing.location.coordinates[1]} 
                  title={listing.title} 
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded flex flex-col items-center justify-center text-gray-400 text-xs">
                <FiMapPin size={24} className="mb-1 opacity-50" />
                <span>Map unavailable</span>
              </div>
            )}
          </div>

          {/* Hide the report button from the owner */}
          {!isOwner && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
               <div className="flex justify-center">
                 <button 
                       onClick={handleReportClick}
                       className="flex items-center gap-2 text-red-600 font-bold hover:underline text-sm"
                   >
                       <FiFlag size={18} /> 
                      Report this ad
                   </button>
               </div>
            </div>
          )}

        </div>
      </div>
      
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        type="ad"
        id={listing._id}
      />

      {/* --- OUR NEW DELETE CONFIRMATION MODAL --- */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Ad"
        message="Are you sure you want to permanently delete this ad? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true} 
      />

      {/* --- OUR NEW LOGIN REQUIRED MODAL --- */}
      <ConfirmModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onConfirm={() => router.push("/login")}
        title="Login Required"
        message="You need an account to view phone numbers, chat with lenders, or report ads. Would you like to log in now?"
        confirmText="Go to Login"
        cancelText="Cancel"
      />
    </div>
  );
}