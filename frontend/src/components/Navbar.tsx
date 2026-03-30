"use client";
import LocationDropdown from "./LocationDropdown";
import { useAuth } from "@/context/AuthContext";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { IoMdArrowBack } from "react-icons/io";
import Pusher from 'pusher-js';
import {
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
  const pathname = usePathname();
  const [active, setActive] = useState("home");

  const { data: session } = useSession();
  const { token, name: authName } = useAuth();
  const { name, profilePhotoUrl } = useUser();

  const { logout } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  const [myMongoId, setMyMongoId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState("free");
  
  const [unreadCount, setUnreadCount] = useState(0); 
  const [notifications, setNotifications] = useState<any[]>([]); 
  const [unreadNotifCount, setUnreadNotifCount] = useState(0); 
  
  const [fetchedPhoto, setFetchedPhoto] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  //  NEW: AUTO-REFRESH FIX FOR SAFEPAY RETURN ---
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

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="w-full fixed top-0 left-0 z-50">
      <div className="w-full bg-[#f2f7ff] border-b border-gray-200 shadow-sm flex items-center justify-between px-6" style={{ height: 72 }}>
        <div className="flex items-center gap-6">
          {pathname === "/create-listing" && (
            <Link href="/" className="text-gray-600 hover:text-blue-600 -mr-4 flex items-center">
              <IoMdArrowBack size={28} />
            </Link>
          )}

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

        <div className="flex items-center gap-4 relative">
          {!hasMounted ? (
            <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse" />
          ) : isLoggedIn ? (
            <>
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
                      {fetchedPhoto || profilePhotoUrl ? (
                        <img src={fetchedPhoto || profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
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
                            {fetchedPhoto || profilePhotoUrl ? (
                              <img src={fetchedPhoto || profilePhotoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
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
                      <Link href="/profile/packages" className="hover:text-[#0077ff] transition flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"><FiTag size={18} /> Buy Discount Packages</Link>
                      <Link href="/profile/my-ads" className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"><FiLayers size={18} /> My Ads</Link>
                      <Link href="/profile/settings" className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"><FiSettings size={18} /> Settings</Link>
                      <button onClick={() => { if (session) signOut(); else if (token) logout(); }} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition px-3 py-2 rounded-md hover:bg-red-50"><FiLogOut size={18} /> Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="text-[#0077ff] font-semibold px-4 py-2 rounded-lg border border-[#0077ff] hover:bg-[#0077ff] hover:text-white transition">Login</Link>
          )}

          <button onClick={() => { if (!hasMounted || (!session && !token)) router.push("/login"); else router.push("/create-listing"); }} className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 p-[3px] transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="bg-white rounded-full px-6 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-[#f9fafb]">
              <span className="text-2xl text-black font-bold leading-none">＋</span>
              <span className="font-bold text-[#002f34] tracking-wide">POST AD</span>
            </div>
          </button>
        </div>
      </div>

      <div className="w-full text-black bg-white border-t border-gray-200 shadow-inner">
        <div className="max-w-6xl mx-auto h-full flex items-center gap-3 px-4" style={{ height: 64 }}>
          <LocationDropdown />
          <div className="flex items-center border rounded-lg bg-white h-10 flex-1 overflow-hidden transition hover:border-[#0077ff]">
            <div className="flex items-center flex-1 min-w-0 px-3">
              <input type="text" placeholder="Find anything you" className="flex-1 min-w-0 text-sm focus:outline-none cursor-text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <button onClick={handleSearch} className="bg-[#002f34] text-white flex items-center justify-center gap-2 px-4 h-full rounded-r-lg hover:bg-[#004247] cursor-pointer"><FiSearch className="text-lg" /><span className="text-sm">Search</span></button>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full bg-[#f2f7ff] border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-2 overflow-auto">
          {sections.map((section) => (
            <button key={section.key} onClick={() => setActive(section.key)} className={`nav-item ${active === section.key ? "active" : ""}`}>{section.label}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}