"use client";
import LocationDropdown from "./LocationDropdown";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { IoMdArrowBack } from "react-icons/io";
import Pusher from 'pusher-js';
import toast from "react-hot-toast";
import {
  FiHome,
  FiBell,
  FiMessageCircle,
  FiUser,
  FiSearch,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiTag,
  FiLogOut,
  FiSettings,
  FiLayers,
} from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [active, setActive] = useState("home");

  // 🚀 THE FIX: Sync search bar text with the current page URL
  useEffect(() => {
    // 1. Handle Active Nav Links
    if (pathname === "/") {
      setActive("home");
    } else if (pathname.startsWith("/about")) {
      setActive("about");
    } else {
      setActive(""); 
    }

    // 2. Handle Search Bar Text
    if (pathname === "/") {
      // If we are on the Home page, ALWAYS clear the search text!
      setSearchQuery(""); 
    } else {
      // If we are on the Search page, sync the text box with the URL word
      const currentQuery = searchParams?.get("query");
      if (currentQuery) {
        setSearchQuery(currentQuery);
      } else {
        setSearchQuery("");
      }
    }
  }, [pathname, searchParams]);

  const { data: session } = useSession();
  const { token, name: authName } = useAuth();
  const { name, profilePhotoUrl } = useUser();

  const { logout } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showMobileProfileMenu, setShowMobileProfileMenu] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  const [myMongoId, setMyMongoId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState("free");
  
  const [unreadCount, setUnreadCount] = useState(0); 
  const [notifications, setNotifications] = useState<any[]>([]); 
  const [unreadNotifCount, setUnreadNotifCount] = useState(0); 
  
  const [fetchedPhoto, setFetchedPhoto] = useState<string | null>(null);

 // 1. The Search Logic
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (searchQuery && searchQuery.trim() !== "") {
      params.set("query", searchQuery.trim());
    } else {
      params.delete("query"); 
    }

    // Forcefully clean old URL data
    params.delete("location");
    params.delete("lat");
    params.delete("lng");

    // 🚀 Read the exact location saved by your Dropdown!
    if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("savedLocation");
      const savedLat = localStorage.getItem("savedLat");
      const savedLng = localStorage.getItem("savedLng");

      // Inject the saved location into the URL
      if (savedLoc && savedLoc !== "Pakistan") {
        params.set("location", savedLoc);
        if (savedLat) params.set("lat", savedLat);
        if (savedLng) params.set("lng", savedLng);
      }
    }

    // Push the fixed URL
    router.push(`/search?${params.toString()}`);
  };

  // 🚀 THE MISSING FUNCTION: This handles the "Enter" key press on the search bar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const [selectedLocation, setSelectedLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const sections = [
    { key: "home", label: "Home" },
    { key: "about", label: "About Us" },
  ];

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // NEW: AUTO-REFRESH FIX FOR SAFEPAY RETURN ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('payment=success')) {
      // 1. Clean the URL so it looks nice and professional
      window.history.replaceState(null, '', window.location.pathname);
      // 2. Force the browser to grab the fresh Premium badge
      window.location.reload(); 
    }
  }, []);

  useEffect(() => {
    const loadPhoto = async () => {
      const localToken = localStorage.getItem("token");
      if (localToken) {
        try {
          const res = await fetch("http://localhost:5000/api/user/profile", {
            headers: { Authorization: `Bearer ${localToken}` }
          });
          const data = await res.json();
          if (data.profilePhotoPath) {
            setFetchedPhoto(`http://localhost:5000${data.profilePhotoPath}?t=${Date.now()}`);
          }
        } catch (e) {
          console.error("Failed to load nav photo");
        }
      }
    };
    loadPhoto();
  }, [token]);

  // --- ISOLATED NOTIFICATION FETCHER ---
  const fetchNotificationsOnly = useCallback(async () => {
    if (!myMongoId) return;
    try {
      const localToken = localStorage.getItem("token");
      const authHeaders: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) authHeaders["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) authHeaders["x-google-email"] = session.user.email;

      const notifRes = await fetch(`http://localhost:5000/api/notifications?t=${Date.now()}`, { headers: authHeaders });
      const notifResult = await notifRes.json();
      
      if (notifResult.success) {
        const sorted = notifResult.data.sort((a: any, b: any) => b._id.localeCompare(a._id));
        setNotifications(sorted);
        setUnreadNotifCount(notifResult.unreadCount || 0);
      }
    } catch (err) {}
  }, [myMongoId, session]);

  // --- THE FIX: WINDOW FOCUS & BACKGROUND POLLING ---
  useEffect(() => {
    // 1. Listen for cross-page clicks
    window.addEventListener("syncNotifications", fetchNotificationsOnly);
    
    // 2. Fetch instantly when user clicks back into the browser tab (matches Google NextAuth behavior)
    window.addEventListener("focus", fetchNotificationsOnly);

    // 3. Poll the server quietly every 30 seconds just in case they are staring at the screen
    const interval = setInterval(() => {
      fetchNotificationsOnly();
    }, 30000);

    return () => {
      window.removeEventListener("syncNotifications", fetchNotificationsOnly);
      window.removeEventListener("focus", fetchNotificationsOnly);
      clearInterval(interval);
    };
  }, [fetchNotificationsOnly]);

  useEffect(() => {
    const fetchBadgeData = async () => {
      let id = (session?.user as any)?.id || (session?.user as any)?._id;
      const localToken = localStorage.getItem("token");
      
      if (!id && localToken) {
        try {
          const payload = JSON.parse(atob(localToken.split(".")[1]));
          id = payload._id || payload.id || payload.userId;
        } catch (e) {}
      }

      if (!id && (localToken || session?.user?.email)) {
        try {
          const headers: HeadersInit = {};
          if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
          else if (session?.user?.email) headers["x-google-email"] = session?.user?.email;
          const profileRes = await fetch("http://localhost:5000/profile", { headers });
          const profileData = await profileRes.json();
          id = profileData?.user?._id;
        } catch (e) {}
      }

      if (!id) return;
      setMyMongoId(id);

      try {
        const planRes = await fetch(`http://localhost:5000/api/subscriptions/status/${id}`);
        const planData = await planRes.json();
        if (planData.success && planData.data) {
          setUserPlan(planData.data.planType);
        }
      } catch (err) {}

      try {
        const res = await fetch(`http://localhost:5000/api/chat/unread-count/${id}?t=${Date.now()}`);
        const result = await res.json();
        if (result.success) setUnreadCount(result.count || 0);
      } catch (err) {}
    };

    fetchBadgeData();
    const timer = setTimeout(fetchBadgeData, 1000);
    return () => clearTimeout(timer);
  }, [session, token]);

  useEffect(() => {
    if (myMongoId) fetchNotificationsOnly();
  }, [myMongoId, fetchNotificationsOnly]);

  const handleReadNotification = async (notifId: string, isRead: boolean) => {
    if (isRead) return; 
    
    try {
      const localToken = localStorage.getItem("token");
      const authHeaders: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) authHeaders["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) authHeaders["x-google-email"] = session.user.email;

      await fetch(`http://localhost:5000/api/notifications/${notifId}/read`, {
        method: "PATCH",
        headers: authHeaders
      });

      setNotifications((prev) => prev.map((n) => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event("syncNotifications"));

    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  useEffect(() => {
    if (!myMongoId) return;

    const refreshBadge = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/unread-count/${myMongoId}?t=${Date.now()}`);
        const result = await res.json();
        if (result.success) setUnreadCount(result.count || 0);
      } catch (err) {}
    };

    const pusher = new Pusher("8007c29c16276e840f53", { cluster: "ap2" });
    const channel = pusher.subscribe(`user-${myMongoId}`);
    
    channel.bind("update-badge", refreshBadge);
    channel.bind("new-message", refreshBadge);

    return () => {
      pusher.unsubscribe(`user-${myMongoId}`);
      pusher.disconnect();
    };
  }, [myMongoId]);

  const isLoggedIn = hasMounted && (!!session || !!token);

  useEffect(() => {
    function handleNotifClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleNotifClickOutside);
    return () => document.removeEventListener("mousedown", handleNotifClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleLocationOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleLocationOutside);
    return () => document.removeEventListener("mousedown", handleLocationOutside);
  }, []);

  const RentzaLogoText = () => (
    <span className="text-3xl font-extrabold text-[#0077ff] leading-none">
      Rentza
    </span>
  );
  
const isListingPage = pathname?.includes("/listings/");
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="w-full fixed top-0 left-0 z-50">
      <div className="w-full bg-[#f2f7ff] border-b border-gray-200 shadow-sm flex items-center justify-between px-6" style={{ height: 72 }}>
       <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="text-2xl font-bold text-blue-600" onClick={() => setActive("home")}>
            <RentzaLogoText />
          </Link>

          <div className="hidden md:flex gap-4">
            {sections.map((section) => (
              <Link
                key={section.key}
                href={section.key === "home" ? "/" : `/${section.key}`}
                onClick={() => setActive(section.key)}
                className={`nav-item ${active === section.key ? "active" : ""}`}
                aria-current={active === section.key ? "page" : undefined}
              >
                {section.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 relative">
  <Link href="/about" className="md:hidden text-[13px] font-bold text-gray-600 hover:text-[#0077ff]">About Us</Link>
          {!hasMounted ? (
            <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse" />
         ) : isLoggedIn ? (
  <div className="hidden md:flex items-center gap-4">
            <Link href="/inbox" className="icon-btn flex items-center justify-center relative">
                <FiMessageCircle className="text-xl text-black cursor-pointer hover:text-[#0077ff]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#f62d51] text-white text-[10px] font-bold h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div ref={notifRef} className="relative">
                <div onClick={() => setShowNotifications(!showNotifications)} className="icon-btn flex items-center justify-center cursor-pointer relative">
                  <FiBell className="text-xl text-black hover:text-[#0077ff]" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#f62d51] text-white text-[10px] font-bold h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </div>

                {showNotifications && (
                  <div className="absolute right-0 top-10 w-80 bg-white shadow-xl border border-gray-200 rounded-lg p-0 z-50 animate-fadeIn overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadNotifCount > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                          {unreadNotifCount} New
                        </span>
                      )}
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">You have no notifications yet.</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => handleReadNotification(n._id, n.isRead)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {n.title}
                              </h4>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-white">
                      <Link 
                        href="/profile/notifications" 
                        onClick={() => setShowNotifications(false)}
                        className="block w-full text-center text-sm text-[#0077ff] font-bold hover:underline"
                      >
                        See All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-1 cursor-pointer">
                  <div className={`rounded-full ${userPlan === 'premium' ? 'p-[2.5px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-sm' : userPlan === 'gold' ? 'p-[2.5px] bg-gradient-to-tr from-yellow-500 via-yellow-200 to-yellow-600 shadow-sm' : ''}`}>
                    <div className={`w-9 h-9 rounded-full overflow-hidden bg-[#0077ff] flex items-center justify-center text-white font-bold ${userPlan !== 'free' ? 'border-2 border-white' : ''}`}>
                      
                      {/* FIXED LOGIC HERE: prioritizing Context over Fetched */}
                      {profilePhotoUrl || fetchedPhoto ? (
                        <img src={profilePhotoUrl || fetchedPhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        name?.charAt(0) || authName?.charAt(0) || session?.user?.name?.charAt(0) || "U"
                      )}

                    </div>
                  </div>
                  {showProfileMenu ? <FiChevronUp className="text-black text-lg" /> : <FiChevronDown className="text-black text-lg" />}
                </button>

                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 mb-2">
                      <Link href="/profile/edit" onClick={() => setShowProfileMenu(false)} className="relative flex-shrink-0 cursor-pointer group hover:opacity-80 transition-opacity">
                        <div className={`rounded-full ${userPlan === 'premium' ? 'p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md' : userPlan === 'gold' ? 'p-[3px] bg-gradient-to-tr from-yellow-500 via-yellow-200 to-yellow-600 shadow-md' : ''}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#0077ff] text-white font-bold ${userPlan !== 'free' ? 'border-2 border-white' : ''}`}>
                            
                            {/* FIXED LOGIC HERE: prioritizing Context over Fetched */}
                            {profilePhotoUrl || fetchedPhoto ? (
                              <img src={profilePhotoUrl || fetchedPhoto || ""} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              name?.charAt(0) || authName?.charAt(0) || session?.user?.name?.charAt(0) || "U"
                            )}

                          </div>
                        </div>
                        <FiEdit2 size={18} className="absolute bottom-0 right-0 text-base bg-white rounded-full p-1 border border-gray-200 text-[#0077ff]" />
                      </Link>

                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-semibold text-gray-800">{name || authName || session?.user?.name || "User"}</p>
                          {userPlan === 'premium' && <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shadow-sm border border-yellow-600 inline-flex items-center gap-1">👑 Premium</span>}
                          {userPlan === 'gold' && <span className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shadow-sm border border-gray-500 inline-flex items-center gap-1">⭐ Gold</span>}
                        </div>
                        <Link href={myMongoId ? `/lender/${myMongoId}` : "/profile/my-ads"} onClick={() => setShowProfileMenu(false)} className="text-xs text-[#0077ff] hover:underline">View public profile</Link>
                      </div>
                    </div>

                    <div className="flex flex-col text-[16px] text-gray-800 font-medium gap-3 mt-2">
                      <Link href="/profile/packages" onClick={() => setShowProfileMenu(false)} className="hover:text-[#0077ff] transition flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"><FiTag size={18} /> Buy Discount Packages</Link>
                      <Link href="/profile/my-ads" onClick={() => setShowProfileMenu(false)} className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"><FiLayers size={18} /> My Ads</Link>
                      <Link href="/profile/settings" onClick={() => setShowProfileMenu(false)} className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"><FiSettings size={18} /> Settings</Link>
                      <button onClick={() => { setShowProfileMenu(false); if (session) signOut(); else if (token) logout(); }} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition px-3 py-2 rounded-md hover:bg-red-50"><FiLogOut size={18} /> Logout</button>
                    </div>
                  </div>
                )}
              </div>
  </div>
) : (
            <Link href="/login" className="text-[#0077ff] font-semibold px-4 py-2 rounded-lg border border-[#0077ff] hover:bg-[#0077ff] hover:text-white transition">Login</Link>
          )}

          <button 
            onClick={() => { 
              sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
              if (!hasMounted || (!session && !token)) router.push("/login"); 
              else router.push("/create-listing"); 
            }} 
            className="hidden md:flex relative items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 p-[3px] transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="bg-white rounded-full px-3 sm:px-6 py-2 flex items-center gap-1 sm:gap-2 transition-all duration-300 hover:bg-[#f9fafb]">
  <span className="text-2xl text-black font-bold leading-none">＋</span>
  <span className="hidden sm:inline font-bold text-[#002f34] tracking-wide">POST AD</span>
</div>
          </button>
        </div>
      </div>

      <div className="w-full text-black bg-white border-t border-gray-200 shadow-inner">
 
  {/* Changed flex-col-reverse to flex-col! */}
  <div className="max-w-6xl mx-auto min-h-[64px] py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-4 z-[60]">
    
    {/* Swapped the order: Search Bar is now FIRST */}
    <div className="flex items-center border rounded-lg bg-white h-10 w-full md:flex-1 overflow-hidden transition hover:border-[#0077ff] order-1 md:order-2">
      <div className="flex items-center flex-1 min-w-0 px-3">
        <input 
          type="text" 
          placeholder="Find anything you need" 
          className="flex-1 min-w-0 text-sm focus:outline-none cursor-text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          onKeyDown={handleKeyDown} 
        />
      </div>
      <button onClick={handleSearch} className="bg-[#002f34] text-white flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 h-full rounded-r-lg hover:bg-[#004247] cursor-pointer">
        <FiSearch className="text-lg" />
        <span className="hidden sm:inline text-sm">Search</span>
      </button>
    </div>

    {/* Swapped the order: Location Dropdown is now SECOND */}
    <div className="w-full md:w-[256px] order-2 md:order-1">
      <LocationDropdown />
    </div>

  </div>
</div>
     {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
      <div className={`${isListingPage ? 'hidden' : 'md:hidden'} fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[100] pb-2 pt-2 px-6`}>
        <div className="flex justify-between items-center h-14">
          
          {/* 1. Home */}
          <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === "/" ? "text-[#0077ff]" : "text-gray-500 hover:text-gray-900"}`}>
            <FiHome size={22} />
            <span className={`text-[10px] ${pathname === "/" ? "font-bold" : "font-medium"}`}>Home</span>
          </Link>

          {/* 2. Chat/Inbox */}
          <Link href={isLoggedIn ? "/inbox" : "/login"} className={`flex flex-col items-center gap-1 relative transition-colors ${pathname.includes("/inbox") ? "text-[#0077ff]" : "text-gray-500 hover:text-gray-900"}`}>
            <FiMessageCircle size={22} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-[#f62d51] text-white text-[8px] font-bold h-3 w-3 flex items-center justify-center rounded-full border border-white"></span>}
            <span className={`text-[10px] ${pathname.includes("/inbox") ? "font-bold" : "font-medium"}`}>Chat</span>
          </Link>

          {/* 3. POST AD Floating Center Button */}
          <div className="flex flex-col items-center relative">
           <button 
              onClick={() => { 
                sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
                if (!hasMounted || (!session && !token)) router.push("/login"); 
                else router.push("/create-listing"); 
              }} 
              className="absolute -top-7 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 p-[3px] shadow-lg transform transition hover:scale-105"
            >
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-2xl text-black font-bold leading-none">＋</span>
              </div>
            </button>
            <span className="text-[10px] font-bold text-[#002f34] mt-7">Post Ad</span>
          </div>

          {/* 4. Notifications */}
          <Link href={isLoggedIn ? "/profile/notifications" : "/login"} className={`flex flex-col items-center gap-1 relative transition-colors ${pathname.includes("/notifications") ? "text-[#0077ff]" : "text-gray-500 hover:text-gray-900"}`}>
            <FiBell size={22} />
            {unreadNotifCount > 0 && <span className="absolute -top-1 -right-1 bg-[#f62d51] text-white text-[8px] font-bold h-3 w-3 flex items-center justify-center rounded-full border border-white"></span>}
            <span className={`text-[10px] ${pathname.includes("/notifications") ? "font-bold" : "font-medium"}`}>Alerts</span>
          </Link>

          {/* 5. Profile */}
          <div ref={mobileProfileRef} className="relative flex flex-col items-center">
            <button 
              onClick={() => { 
                if (!isLoggedIn) router.push("/login"); 
                else setShowMobileProfileMenu(!showMobileProfileMenu); 
              }} 
              className={`flex flex-col items-center gap-1 outline-none transition-colors ${pathname.includes("/profile") || showMobileProfileMenu ? "text-[#0077ff]" : "text-gray-500 hover:text-gray-900"}`}
            >
              <FiUser size={22} />
              <span className={`text-[10px] ${pathname.includes("/profile") || showMobileProfileMenu ? "font-bold" : "font-medium"}`}>Profile</span>
            </button>
 {/* THE COMPLETE MOBILE OPTIONS MENU */}
            {showMobileProfileMenu && isLoggedIn && (
              <div className="absolute bottom-16 right-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[110] animate-fadeIn">
                
                {/* --- 1. USER PROFILE HEADER --- */}
                <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
                  
                  {/* Avatar WITH the Pencil Icon over it (Clicking this goes to Edit Profile) */}
                 <Link href="/profile/edit" onClick={() => setShowMobileProfileMenu(false)} className="relative shrink-0 block cursor-pointer transition hover:opacity-80">
                    
                    {/* 1. Add the gradient ring based on the user's plan (Matching Desktop) */}
                    <div className={`rounded-full ${userPlan === 'premium' ? 'p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-md' : userPlan === 'gold' ? 'p-[3px] bg-gradient-to-tr from-yellow-500 via-yellow-200 to-yellow-600 shadow-md' : ''}`}>
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-[#0077ff] text-white font-bold overflow-visible ${userPlan !== 'free' ? 'border-2 border-white' : ''}`}>
                        
                        {/* 2. The Profile Image (Prioritize Context/Fetched over Session) */}
                        {profilePhotoUrl || fetchedPhoto || session?.user?.image ? (
                          <img 
                            src={profilePhotoUrl || fetchedPhoto || session?.user?.image || ""} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        ) : (
                          name?.charAt(0) || authName?.charAt(0) || session?.user?.name?.charAt(0) || "U"
                        )}

                        {/* 3. Add the tiny Premium Badge overlapping the image */}
                        {userPlan === 'premium' && (
                          <div className="absolute -top-1 -right-1 bg-[#007bff] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white z-10 shadow-sm">
                            👑
                          </div>
                        )}
                        {userPlan === 'gold' && (
                          <div className="absolute -top-1 -right-1 bg-[#FFD700] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white z-10 shadow-sm">
                            ⭐
                          </div>
                        )}
                      </div>
                    </div>
                    {/* The overlapping pencil badge */}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200 text-[#0077ff] shadow-sm">
                      <FiEdit2 size={12} />
                    </div>
                  </Link>

                  {/* User's Name & Public Profile Link */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-[16px] leading-tight">
                      {name || authName || session?.user?.name || "User"}
                    </p>
                    <Link 
                      href={myMongoId ? `/lender/${myMongoId}` : "/profile/my-ads"} 
                      onClick={() => setShowMobileProfileMenu(false)} 
                      className="text-[13px] text-[#0077ff] hover:underline block mt-0.5"
                    >
                      View public profile
                    </Link>
                  </div>

                </div>
                {/* --- 2. MENU OPTIONS --- */}
                <div className="flex flex-col text-sm text-gray-700 font-medium">
                  
                  <Link href="/profile/packages" onClick={() => setShowMobileProfileMenu(false)} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3 transition-colors">
                    <FiTag size={18} className="text-gray-500" /> Buy Packages
                  </Link>
                  
                  <Link href="/profile/my-ads" onClick={() => setShowMobileProfileMenu(false)} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3 transition-colors">
                    <FiLayers size={18} className="text-gray-500" /> My Ads
                  </Link>
                  
                  <Link href="/profile/settings" onClick={() => setShowMobileProfileMenu(false)} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-3 transition-colors">
                    <FiSettings size={18} className="text-gray-500" /> Settings
                  </Link>
                  
                  <button onClick={() => { setShowMobileProfileMenu(false); if (session) signOut(); else if (token) logout(); }} className="px-4 py-3 text-red-500 hover:bg-red-50 flex items-center gap-3 text-left w-full transition-colors">
                    <FiLogOut size={18} /> Logout
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}