"use client";
import LocationDropdown from "./LocationDropdown";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { IoMdArrowBack } from "react-icons/io";
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
  const searchParams = useSearchParams();
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

  // --- NEW: STATE TO HOLD MONGODB ID ---
  const [myMongoId, setMyMongoId] = useState<string | null>(null);

 const handleSearch = () => {
    if (!searchQuery || searchQuery.trim() === "") {
      alert("Please enter an item or category (e.g., 'cars', 'bike') before searching.");
      return; 
    }
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("query", searchQuery);
    router.push(`/search?${params.toString()}`);
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

  // --- NEW: CRACK TOKEN TO GET ID ---
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      try {
        const payload = JSON.parse(atob(localToken.split(".")[1]));
        setMyMongoId(payload.id);
      } catch (e) {
        console.error("Could not parse token for profile link");
      }
    }
  }, [token]); // Re-run if token changes

  const isLoggedIn = hasMounted && (!!session || !!token);

  useEffect(() => {
    function handleNotifClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleNotifClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleNotifClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleLocationOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleLocationOutside);
    return () =>
      document.removeEventListener("mousedown", handleLocationOutside);
  }, []);

  const RentzaLogoText = () => (
    <span className="text-3xl font-extrabold text-[#0077ff] leading-none">
      Rentza
    </span>
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="w-full fixed top-0 left-0 z-50">
      <div
        className="w-full bg-[#f2f7ff] border-b border-gray-200 shadow-sm flex items-center justify-between px-6"
        style={{ height: 72 }}
      >
        <div className="flex items-center gap-6">
          {pathname === "/create-listing" && (
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 -mr-4 flex items-center"
            >
              <IoMdArrowBack size={28} />
            </Link>
          )}

          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
            onClick={() => setActive("home")}
          >
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
              <Link
                href="/inbox"
                className="icon-btn flex items-center justify-center"
              >
                <FiMessageCircle className="text-xl text-black cursor-pointer hover:text-[#0077ff]" />
              </Link>

              <div ref={notifRef} className="relative">
                <div
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="icon-btn cursor-pointer"
                >
                  <FiBell className="text-xl text-black hover:text-[#0077ff]" />
                </div>

                {showNotifications && (
                  <div className="absolute right-0 top-10 w-72 bg-white shadow-lg border border-gray-200 rounded-lg p-4 z-50 animate-fadeIn">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-500 text-center py-4">
                      You have no notifications yet.
                    </p>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#0077ff] flex items-center justify-center text-white font-bold">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      name?.charAt(0) ||
                      authName?.charAt(0) ||
                      session?.user?.name?.charAt(0) ||
                      "U"
                    )}
                  </div>
                  {showProfileMenu ? (
                    <FiChevronUp className="text-black text-lg" />
                  ) : (
                    <FiChevronDown className="text-black text-lg" />
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2 mb-2">
                      <Link
                        href="/profile/edit"
                        onClick={() => setShowProfileMenu(false)}
                        className="relative flex-shrink-0 cursor-pointer group hover:opacity-80 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0077ff] text-white font-bold">
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            name?.charAt(0) ||
                            authName?.charAt(0) ||
                            session?.user?.name?.charAt(0) ||
                            "U"
                          )}
                        </div>
                        <FiEdit2
                          size={18}
                          className="absolute bottom-0 right-0 text-base bg-white rounded-full p-1 border border-gray-200 text-[#0077ff]"
                        />
                      </Link>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {name || authName || session?.user?.name || "User"}
                        </p>
                        {/* --- UPDATED PUBLIC PROFILE LINK --- */}
                        <Link
                          href={
                            myMongoId
                              ? `/lender/${myMongoId}`
                              : "/profile/my-ads"
                          }
                          onClick={() => setShowProfileMenu(false)}
                          className="text-xs text-[#0077ff] hover:underline"
                        >
                          View public profile
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col text-[16px] text-gray-800 font-medium gap-3 mt-2">
                      <Link
                        href="/profile/packages"
                        className="hover:text-[#0077ff] transition flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                      >
                        <FiTag size={18} /> Buy Discount Packages
                      </Link>
                      <Link
                        href="/profile/my-ads"
                        className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FiLayers size={18} /> My Ads
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="hover:text-[#0077ff] transition px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FiSettings size={18} /> Settings
                      </Link>

                      <button
                        onClick={() => {
                          if (session) signOut();
                          else if (token) logout();
                        }}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 transition px-3 py-2 rounded-md hover:bg-red-50"
                      >
                        <FiLogOut size={18} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="text-[#0077ff] font-semibold px-4 py-2 rounded-lg border border-[#0077ff] hover:bg-[#0077ff] hover:text-white transition"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => {
              if (!hasMounted || (!session && !token)) router.push("/login");
              else router.push("/create-listing");
            }}
            className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 p-[3px] transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="bg-white rounded-full px-6 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-[#f9fafb]">
              <span className="text-2xl text-black font-bold leading-none">
                ＋
              </span>
              <span className="font-bold text-[#002f34] tracking-wide">
                POST AD
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="w-full text-black bg-white border-t border-gray-200 shadow-inner">
        <div className="max-w-6xl mx-auto h-full flex items-center gap-3 px-4" style={{ height: 64 }}>
          <LocationDropdown />

          <div className="flex items-center border rounded-lg bg-white h-10 flex-1 overflow-hidden transition hover:border-[#0077ff]">
            <div className="flex items-center flex-1 min-w-0 px-3">
              <input
                type="text"
                placeholder="Find anything you"
                className="flex-1 min-w-0 text-sm focus:outline-none cursor-text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              onClick={handleSearch}
              className="bg-[#002f34] text-white flex items-center justify-center gap-2 px-4 h-full rounded-r-lg hover:bg-[#004247] cursor-pointer"
            >
              <FiSearch className="text-lg" />
              <span className="text-sm">Search</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden w-full bg-[#f2f7ff] border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-2 overflow-auto">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActive(section.key)}
              className={`nav-item ${active === section.key ? "active" : ""}`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
