"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSession, signOut } from "next-auth/react";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Import hook
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiEdit2,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function AdminTopbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter(); // <-- router for logout redirect

  const { data: session } = useSession();
  const { role, logout, token, name: authName } = useAuth();
  const { name, profilePhotoUrl, setName, setProfilePhotoUrl } = useUser(); // Define titles for each path
  const pageTitles: { [key: string]: string } = {
    "/admin/dashboard": "Dashboard",
    "/admin/users": "Users",
    "/admin/listings": "Listings",
    "/admin/reports": "Reports",
    "/admin/analytics": "Analytics",
    "/admin/profile/edit": "Edit Profile",
    "/admin/profile/settings": "Settings",
  };
  const { clearUser } = useUser();

  const handleLogout = () => {
    logout();
    clearUser();
    setIsDropdownOpen(false);
    router.push("/");
  };

  // Get the title for the current path, or default to 'Admin Panel'
  const displayTitle = pageTitles[pathname] || "Dashboard";
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    setUnderlineWidth(0); // reset first

    requestAnimationFrame(() => {
      if (titleRef.current) {
        setUnderlineWidth(titleRef.current.getBoundingClientRect().width);
      }
    });
  }, [displayTitle, pathname]);
  useEffect(() => {
    const measure = () => {
      if (!titleRef.current) return;

      const width = titleRef.current.getBoundingClientRect().width;
      setUnderlineWidth(width);
    };

    // wait for layout + fonts
    requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    // also re-run after fonts load (important fix)
    if (document.fonts) {
      document.fonts.ready.then(measure);
    }
  }, [displayTitle]);
  useEffect(() => {
    const loadAdminProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.profilePhotoPath) {
        setProfilePhotoUrl(`http://localhost:5000${data.profilePhotoPath}`);
      }

      if (data.name) {
        setName(data.name);
      }
    };

    loadAdminProfile();
  }, [token]); // ✅ important

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (
    /^\/admin\/users\/[^/]+\/?$/.test(pathname) ||
    /^\/admin\/listings\/[^/]+\/?$/.test(pathname) ||
    /^\/admin\/reports\/[^/]+\/?$/.test(pathname)
  ) {
    return null;
  }

  return (
    <header
      className="
  h-[90px]
  w-[calc(100vw-260px)]
  ml-auto
  flex items-center justify-between px-10

  border-b border-white/10

  bg-gradient-to-r from-[#f8fbff] via-white to-[#f3f7ff]

  backdrop-blur-2xl
  shadow-[0_8px_30px_rgb(0,0,0,0.04)]

  relative z-50 overflow-visible
"
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute -top-32 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" />
      </div>{" "}
      {/* --- DYNAMIC PAGE TITLE --- */}
      <div className="flex flex-col items-start">
        <h2
          ref={titleRef}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          {displayTitle}
        </h2>

        <div
          className="mt-1 h-[3px] rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#6366f1] transition-all duration-300"
          style={{ width: underlineWidth }}
        />
      </div>
      {/* --- PROFILE DROPDOWN AREA --- */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div
            className="
  w-10 h-10 rounded-full
  bg-gradient-to-br from-[#1d4ed8] to-[#6366f1]
  flex items-center justify-center text-white
  shadow-md shadow-blue-500/20
  transition-all duration-300
  hover:scale-110 hover:rotate-2
"
          >
            {" "}
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
          <FiChevronDown
            className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isDropdownOpen && (
          <div
            className="
  absolute right-0 top-14 w-56
  bg-white/90 backdrop-blur-xl
  border border-gray-100
  rounded-xl
  shadow-xl shadow-black/5
  py-2 z-[9999]
"
          >
            {" "}
            {/* Avatar + Name container */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5] mb-1">
              {/* Avatar */}
              <div
                className="
w-10 h-10 rounded-full
bg-gradient-to-br from-[#1d4ed8] to-[#6366f1]
flex items-center justify-center text-white
shadow-md shadow-blue-500/20
transition-all duration-300
hover:scale-110 hover:rotate-2
"
              >
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
              {/* Name */}
              <p className="text-sm font-bold text-[#002f34]">
                {name || authName || session?.user?.name || "User"}
              </p>
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
              onClick={handleLogout}
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
