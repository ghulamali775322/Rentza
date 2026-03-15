"use client";
import Link from "next/link";
import { MOCK_LISTINGS } from "@/data/mockListings";
import { useState, useRef, useEffect, useLayoutEffect, JSX } from "react";
import { FiChevronDown, FiSmartphone, FiHome } from "react-icons/fi";
import { FaCarSide, FaCouch, FaFootballBall } from "react-icons/fa";
import {
  GiScooter,
  GiTreehouse,
  GiHammerNails,
  GiClothes,
} from "react-icons/gi";
import { TbBike } from "react-icons/tb";
import { MdOutlineDevices } from "react-icons/md";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const categories = [
    "Mobile Phones",
    "Cars",
    "Bikes",
    "Bicycles",
    "Houses & Flats",
    "Plots & Land",
    "Furniture",
    "Electronics & Home Appliances",
    "Equipment & Tools",
    "Fashion & Personal Items",
    "Sports Equipment",
  ];

  const categoryIcons: Record<string, JSX.Element> = {
    "Mobile Phones": <FiSmartphone className="text-blue-600 text-3xl" />,
    Cars: <FaCarSide className="text-blue-600 text-3xl" />,
    Bikes: <GiScooter className="text-blue-600 text-3xl" />,
    Bicycles: <TbBike className="text-blue-600 text-3xl" />,
    "Houses & Flats": <FiHome className="text-blue-600 text-3xl" />,
    "Plots & Land": <GiTreehouse className="text-blue-600 text-3xl" />,
    Furniture: <FaCouch className="text-blue-600 text-3xl" />,
    "Electronics & Home Appliances": (
      <MdOutlineDevices className="text-blue-600 text-3xl" />
    ),
    "Equipment & Tools": <GiHammerNails className="text-blue-600 text-3xl" />,
    "Fashion & Personal Items": (
      <GiClothes className="text-blue-600 text-3xl" />
    ),
    "Sports Equipment": <FaFootballBall className="text-blue-600 text-3xl" />,
  };

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom - rect.top + 50);
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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const listings = {
    Cars: [
      {
        title: "Suzuki Alto 2020",
        price: "PKR 2,250,000",
        location: "Lahore",
        time: "7 days ago",
        image: "/car1.jpg",
      },
      {
        title: "Toyota Corolla 2019",
        price: "PKR 4,000,000",
        location: "Karachi",
        time: "2 weeks ago",
        image: "/car2.jpg",
      },
      {
        title: "Honda City 2021",
        price: "PKR 3,500,000",
        location: "Islamabad",
        time: "3 weeks ago",
        image: "/car3.jpg",
      },
      {
        title: "Kia Sportage 2022",
        price: "PKR 7,200,000",
        location: "Rawalpindi",
        time: "5 weeks ago",
        image: "/car4.jpg",
      },
    ],
    "Houses & Flats": [
      {
        title: "5 Marla House",
        price: "PKR 18,000,000",
        location: "Johar Town, Lahore",
        time: "12 hours ago",
        image: "/house1.jpg",
      },
      {
        title: "Flat for Rent",
        price: "PKR 45,000/month",
        location: "Gulshan-e-Iqbal, Karachi",
        time: "2 days ago",
        image: "/flat1.jpg",
      },
      {
        title: "10 Marla House",
        price: "PKR 32,000,000",
        location: "DHA Phase 6, Lahore",
        time: "1 week ago",
        image: "/house2.jpg",
      },
      {
        title: "Studio Apartment",
        price: "PKR 20,000/month",
        location: "Islamabad",
        time: "3 weeks ago",
        image: "/flat2.jpg",
      },
    ],
    Bikes: [
      {
        title: "Honda CG 125",
        price: "PKR 240,000",
        location: "Faisalabad",
        time: "4 days ago",
        image: "/bike1.jpg",
      },
      {
        title: "Yamaha YBR 125",
        price: "PKR 390,000",
        location: "Karachi",
        time: "2 weeks ago",
        image: "/bike2.jpg",
      },
      {
        title: "Suzuki GS 150",
        price: "PKR 380,000",
        location: "Lahore",
        time: "3 weeks ago",
        image: "/bike3.jpg",
      },
      {
        title: "United 70cc",
        price: "PKR 120,000",
        location: "Multan",
        time: "6 weeks ago",
        image: "/bike4.jpg",
      },
    ],
  };

   const renderListings = (categoryName: string) => {
    
    // Filter the shared data for this category and take the first 4 items
    const categoryItems = MOCK_LISTINGS
      .filter((item) => item.category === categoryName)
      .slice(0, 4);

    return (
      <section className="px-10 py-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{categoryName}</h2>
          <Link 
            href={`/search?category=${encodeURIComponent(categoryName)}`} 
            className="text-blue-600 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categoryItems.map((item) => (
            <Link 
              key={item.id} 
              href={`/listings/${item.id}`} // Link to the detail page
              className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:-translate-y-1 block"
            >
              <div className="h-40 bg-gray-200">
                <img
                  src={item.image} // Uses the same image from your mock data
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {item.title}
                </h3>
                <p className="text-blue-600 font-bold text-sm mt-1">
                  {item.price}
                </p>
                <p className="text-gray-500 text-xs mt-1">{item.location}</p>
                {/* Ensure 'time' exists in your MOCK_LISTINGS or use a static value */}
                <p className="text-gray-400 text-xs mt-1">2 days ago</p> 
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="relative border-t border-gray-200 bg-white z-10">
      {/* ======= CATEGORY BAR ======= */}
      <div className="flex items-center gap-6 px-10 py-3 text-gray-800 text-[15px] font-medium">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1 font-semibold transition-colors ${
            isOpen ? "text-[#0077ff]" : "text-gray-900 hover:text-[#0077ff]"
          }`}
        >
          All Categories
          <FiChevronDown
            className={`transition-transform ${
              isOpen ? "rotate-180 text-[#0077ff]" : "rotate-0"
            }`}
          />
        </button>

       {categories.slice(0, 8).map((cat) => (
  // CHANGE: Use Link instead of span
  <Link
    key={cat}
    href={`/search?category=${encodeURIComponent(cat)}`}
    className="cursor-pointer hover:text-[#0077ff] transition-colors"
  >
    {cat}
  </Link>
))}
      </div>

      {/* ======= DROPDOWN ======= */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-10 w-80 bg-white shadow-lg rounded-md border border-gray-200 z-20"
          style={{ top: dropdownTop }}
        >
          <ul className="max-h-80 overflow-y-auto p-3 space-y-2">
            {categories.map((cat) => (
  // CHANGE: Wrap list item content in Link or make the item a Link
  <li key={cat}>
    <Link
      href={`/search?category=${encodeURIComponent(cat)}`}
      onClick={() => setIsOpen(false)} // Close dropdown on click
      className="block cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md text-gray-700"
    >
      {cat}
    </Link>
  </li>
))}
          </ul>
        </div>
      )}

      {/* ======= POPULAR CATEGORIES ======= */}
      <section className="px-10 py-6 bg-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
  // ADD THIS LINK WRAPPER
  <Link 
    key={cat} 
    href={`/search?category=${encodeURIComponent(cat)}`} 
    className="contents" // Keeps layout intact
  >
    <div
      className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:bg-blue-50"
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-3">
        {categoryIcons[cat]}
      </div>
      <p className="text-gray-800 font-medium text-sm text-center">
        {cat}
      </p>
    </div>
  </Link>
))}
        </div>
      </section>

      {/* ======= RECENT LISTINGS ======= */}
      {renderListings("Cars")}
      {renderListings("Houses & Flats")}
      {renderListings("Bikes")}

      {/* ======= SAFETY GUIDELINES ======= */}
      <section className="px-10 py-12 bg-gray-50">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-10">
          Safety Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Renters */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              For Renters
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Meet lenders in public, safe locations.</li>
              <li>✔️ Inspect items before making payments.</li>
              <li>✔️ Avoid online or advance transfers.</li>
              <li>✔️ Ask for ID for trust and transparency.</li>
              <li>✔️ Report fake or suspicious listings quickly.</li>
            </ul>
          </div>

          {/* For Lenders */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              For Lenders
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Verify renter’s CNIC or ID before lending.</li>
              <li>✔️ Don’t hand over items without confirmation.</li>
              <li>✔️ Keep a record or agreement in writing.</li>
              <li>✔️ Take photos of items before renting.</li>
              <li>✔️ Block and report scams immediately.</li>
            </ul>
          </div>

          {/* Platform Guidelines */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-500 hover:-translate-y-2 hover:bg-blue-50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">
              Platform Guidelines
            </h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>✔️ Rentza connects renters and lenders only.</li>
              <li>✔️ We don’t handle payments or guarantees.</li>
              <li>✔️ Communicate only through verified accounts.</li>
              <li>✔️ Fraudulent listings lead to permanent bans.</li>
              <li>✔️ Help us keep Rentza safe and trusted.</li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
      </section>
    </div>
  );
}
