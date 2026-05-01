"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useLayoutEffect, JSX } from "react";
import { FiChevronDown, FiSmartphone, FiHome, FiMenu } from "react-icons/fi";
import {
  FaCarSide,
  FaCouch,
  FaFootballBall,
  FaEllipsisH,
} from "react-icons/fa";
import { GiTreehouse, GiHammerNails, GiClothes } from "react-icons/gi";
import { TbBike } from "react-icons/tb";
import { MdOutlineDevices } from "react-icons/md";
import ListingCard from "@/components/ListingCard";

const CATEGORIES_DATA = [
  {
    name: "Mobiles",
    image: "/categories/mobile.png",
    icon: <FiSmartphone className="text-blue-600 text-3xl" />,
    subcategories: [
      "Mobile Phones",
      "Power Bank",
      "Tablets",
      "Mobile Charger ",
    ],
  },
  {
    name: "Vehicles",
    image: "/categories/car.png",
    icon: <FaCarSide className="text-blue-600 text-3xl" />,
    subcategories: ["Cars", "Spare Parts"],
  },
  {
    name: "Property for Rent",
    image: "/categories/rent.png",
    icon: <FiHome className="text-blue-600 text-3xl" />,
    subcategories: ["Houses", "Apartments", "Rooms", "Shop", "Office"],
  },
  {
    name: "Electronics & Home Appliances",
    image: "/categories/electronic.png",
    icon: <MdOutlineDevices className="text-blue-600 text-3xl" />,
    subcategories: [
      "Computers",
      "TVs",
      "Kitchen Appliances",
      "Cameras",
      "AC & Coolers",
      "Smart Home Device",
      "Genrator & Ups",
    ],
  },
  {
    name: "Bikes",
    image: "/categories/bike.png",
    icon: <TbBike className="text-blue-600 text-3xl" />,
    subcategories: [
      "Motorcycles",
      "Scooters",
      "Bicycles",
    ],
  },
  {
    name: "Agriculture Machinery & Tools",
    image: "/categories/tractor.png",
    icon: <GiHammerNails className="text-blue-600 text-3xl" />,
    subcategories: [
      "Machinery",
      "Tractors",
      "Agriculture Tools",
    ],
  },
  {
    name: "Furniture & Home Decor",
    image: "/categories/furniture.png",
    icon: <FaCouch className="text-blue-600 text-3xl" />,
    subcategories: [
      "Sofa & Chairs",
      "Beds & Wardrobes",
      "Tables",
      "Office Furniture",
      "Decor",
    ],
  },
  {
    name: "Fashion & Beauty",
    image: "/categories/fashion.png",
    icon: <GiClothes className="text-blue-600 text-3xl" />,
    subcategories: [
      "Men",
      "Women",
      "Kids Clothing",
      "Beauty Products",
    ],
  },
  {
    name: "Books, Sports & Hobbies",
    image: "/categories/book.png",
    icon: <FaFootballBall className="text-blue-600 text-3xl" />,
    subcategories: [
      "Books",
      "Musical Instruments",
      "Sports Equipment",
      "Gym & Fitness",
    ],
  },
  {
    name: "Outdoor Equipment",
    image: "/categories/outdoor.png",
    icon: <GiTreehouse className="text-blue-600 text-3xl" />,
    subcategories: ["Camping", "Hiking", "Fishing", "Skiing"],
  },
  {
    name: "Other",
    image: "/categories/other.png",
    icon: <FaEllipsisH className="text-blue-600 text-3xl" />,
    subcategories: ["Miscellaneous"],
  },
];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role === "admin") {
      router.replace("/admin");
    }
  }, [role, router]);
  const handleCategoryClick = (e: React.MouseEvent, catName: string | null) => {
    e.preventDefault(); 
    
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (catName) {
      params.set("category", catName);
    } else {
      params.delete("category");
    }

    const currentLoc = searchParams?.get("location");
    const currentLat = searchParams?.get("lat");
    const currentLng = searchParams?.get("lng");

    if (currentLoc && currentLoc !== "Pakistan") {
      params.set("location", currentLoc);
      if (currentLat) params.set("lat", currentLat);
      if (currentLng) params.set("lng", currentLng);
    } 
    // Fallback: ALWAYS read fresh memory right when clicked
    else if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("savedLocation");
      const savedLat = localStorage.getItem("savedLat");
      const savedLng = localStorage.getItem("savedLng");

      if (savedLoc && savedLoc !== "Pakistan") {
        params.set("location", savedLoc);
        if (savedLat) params.set("lat", savedLat);
        if (savedLng) params.set("lng", savedLng);
      }
    }

    // Navigate instantly!
    router.push(`/search?${params.toString()}`);
  };

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const [realListings, setRealListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- THE ANTI-BLINK SCROLL STATE ---
  const [savedScrollPos, setSavedScrollPos] = useState<number | null>(null);

  // 1. Grab the scroll position immediately before anything else happens
  useEffect(() => {
    const pos = sessionStorage.getItem("homeScrollPos");
    if (pos) {
      setSavedScrollPos(parseInt(pos));
    }
  }, []);

  // 2. Fetch the listings normally
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/listings");
        const result = await response.json();
        if (result.success) {
          setRealListings(result.data);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  // 3. The Magic Hook: This runs BEFORE the browser paints the screen, stopping the blink!
  useLayoutEffect(() => {
    if (!isLoading && savedScrollPos !== null) {
      window.scrollTo({ top: savedScrollPos, behavior: "instant" });
      sessionStorage.removeItem("homeScrollPos");
    }
  }, [isLoading, savedScrollPos]);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom - rect.top + 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setExpandedCat(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderListings = (mainCategoryData: (typeof CATEGORIES_DATA)[0]) => {
    const categoryItems = realListings
      .filter(
        (item) =>
          mainCategoryData.subcategories.includes(item.category) ||
          item.category === mainCategoryData.name,
      )
      // ADDED: Sort by newest 'createdAt' date before slicing!
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);

    if (categoryItems.length === 0) return null;

    return (
      <section className="px-4 md:px-10 py-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {mainCategoryData.name}
          </h2>
          <Link
  href={`/search?category=${mainCategoryData.name}`}
  onClick={(e) => {
    sessionStorage.setItem("homeScrollPos", window.scrollY.toString());
    handleCategoryClick(e, mainCategoryData.name); // <--- THIS IS REQUIRED
  }}
  className="text-blue-600 hover:underline font-medium"
>
  View All
</Link>
        </div>
        {/* Notice we added 'flex md:grid' so it swipes on phones but stays a grid on laptops! */}
        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categoryItems.map((item) => (
            /* We lock the width to 200px on mobile, but let it fill the grid automatically on desktop (md:w-auto) */
            <div
              key={item._id}
              className="w-[200px] sm:w-[250px] md:w-auto flex-shrink-0 snap-start"
            >
              <ListingCard data={item} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="relative border-t border-gray-200 bg-white z-10">
      {/* ======= CATEGORY BAR ======= */}
    <div className="flex items-center justify-between gap-3 px-4 md:px-10 py-3 text-gray-800 text-[15px] font-medium overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1 font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
            isOpen ? "text-[#0077ff]" : "text-gray-900 hover:text-[#0077ff]"
          }`}
        >
          <FiMenu size={18} />
          All Categories
          <FiChevronDown
            className={`transition-transform ${isOpen ? "rotate-180 text-[#0077ff]" : "rotate-0"}`}
          />
        </button>

      {CATEGORIES_DATA.slice(0, 6).map((cat) => (
         <Link
    key={cat.name}
    href={`/search?category=${cat.name}`}
    onClick={(e) => handleCategoryClick(e, cat.name)} // <--- THIS IS REQUIRED
    className="cursor-pointer hover:text-[#0077ff] transition-colors whitespace-nowrap"
  >
    {cat.name}
  </Link>
        ))}
      </div>

      {/* ======= DROPDOWN (Accordion Style) ======= */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-4 md:left-10 w-[calc(100vw-32px)] md:w-[350px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-lg border border-gray-100 z-20"
          style={{ top: dropdownTop }}
        >
          <ul className="max-h-[65vh] overflow-y-auto p-2 custom-scrollbar">
            {CATEGORIES_DATA.map((mainCat) => {
              const isExpanded = expandedCat === mainCat.name;

              return (
                <li
                  key={mainCat.name}
                  className="border-b border-gray-50 last:border-0"
                >
                  <div className="flex justify-between items-center px-3 py-3 hover:bg-gray-50 rounded-md transition-colors">
                    <Link
  href={`/search?category=${mainCat.name}`}
  onClick={(e) => { 
      setIsOpen(false); 
      handleCategoryClick(e, mainCat.name); // <--- THIS IS REQUIRED
  }}
                      className="font-semibold text-gray-800 hover:text-[#0077ff] flex-grow"
                    >
                      {mainCat.name}
                    </Link>
                    <button
                      onClick={() =>
                        setExpandedCat(isExpanded ? null : mainCat.name)
                      }
                      className="p-1 text-gray-400 hover:text-[#0077ff] hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FiChevronDown
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        size={18}
                      />
                    </button>
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <ul className="overflow-hidden pl-4 ml-3 border-l-2 border-blue-100 mb-2 space-y-1">
                      {mainCat.subcategories.map((subCat) => (
                        <li key={subCat}>
                          <Link
  href={`/search?category=${subCat}`}
  onClick={(e) => {
    setIsOpen(false); // 1. Close the menu
    handleCategoryClick(e, subCat); // 2. Grab location and navigate!
  }}
                            className="block text-sm text-gray-600 hover:text-[#0077ff] py-1.5 px-2 rounded-md hover:bg-blue-50/50"
                          >
                            {subCat}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ======= POPULAR CATEGORIES ======= */}
      <section className="px-4 md:px-10 py-6 bg-gray-50">
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[110px] md:grid-rows-none md:grid-flow-row md:grid-cols-6 gap-3 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x [&::-webkit-scrollbar]:hidden">
          {CATEGORIES_DATA.map((cat) => (
           <Link
    key={cat.name}
    href={`/search?category=${cat.name}`}
    onClick={(e) => handleCategoryClick(e, cat.name)}
              className="snap-start h-full"
            >
              <div className="flex flex-col items-center justify-center bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all duration-300 cursor-pointer h-full">
                {/* Responsive Icon Sizes */}
                <div className="w-[40px] h-[40px] md:w-[70px] md:h-[70px] mb-2 md:mb-5 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain scale-125 md:scale-180"
                  />
                </div>

                <p className="text-gray-800 font-medium text-[10px] md:text-sm text-center leading-tight">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* ======= RECENT LISTINGS ======= */}
      {isLoading ? (
        <div
          className="flex justify-center pt-20 text-gray-500 font-bold text-lg animate-pulse w-full"
          // THE FIX: If a scroll position is saved, artificially pad the page so the browser doesn't hit the footer!
          style={{
            minHeight: savedScrollPos ? `${savedScrollPos + 1000}px` : "50vh",
          }}
        >
          Loading latest ads...
        </div>
      ) : realListings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No ads found in the database yet.
        </div>
      ) : (
        <>
          {CATEGORIES_DATA.map((catData) => (
            <div key={catData.name}>{renderListings(catData)}</div>
          ))}
        </>
      )}

      {/* ======= SAFETY GUIDELINES ======= */}
      <section className="px-4 md:px-10 py-12 bg-gray-50">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-10">
          Safety Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              For Renters
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Meet lenders in public, safe locations.</li>
              <li>✔️ Inspect items before making payments.</li>
              <li>✔️ Avoid online or advance transfers.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              For Lenders
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Verify renter’s CNIC or ID before lending.</li>
              <li>✔️ Don’t hand over items without confirmation.</li>
              <li>✔️ Take photos of items before renting.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              Platform Guidelines
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Rentza connects renters and lenders only.</li>
              <li>✔️ We don’t handle payments or guarantees.</li>
              <li>✔️ Fraudulent listings lead to permanent bans.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}