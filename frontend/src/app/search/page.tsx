"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { MOCK_LISTINGS } from "@/data/mockListings";
// 1. IMPORT FiCheck for the dropdown selection
import { FiChevronDown, FiFilter, FiMapPin, FiCheck } from "react-icons/fi"; // <--- CHANGED

export default function SearchPage() {
  // 2. RENAME state to 'isSortOpen' for clarity
  const [isSortOpen, setIsSortOpen] = useState(false); // <--- CHANGED
  const [selected, setSelected] = useState("Newly listed");
  
  const options = [
    "Newly listed",
    "Most relevant",
    "Lowest price",
    "Highest price",
  ];
  
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const query = searchParams.get("query");

  // State for Location Dropdown
  const [selectedLocation, setSelectedLocation] = useState("Pakistan");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  // Price State
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const locations = ["Pakistan", "Punjab", "Sindh", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad"];

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  // --- FILTER LOGIC ---
  const filteredListings = MOCK_LISTINGS.filter((item) => {
    const matchCategory = category ? item.category === category : true;
    
    const matchQuery = query 
      ? item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchLocation = selectedLocation === "Pakistan" 
      ? true 
      : item.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
    const itemPrice = parsePrice(item.price); 
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    
    const matchPrice = itemPrice >= min && itemPrice <= max;

    return matchCategory && matchQuery && matchLocation && matchPrice; 
  });

  // === 3. NEW SORTING LOGIC ADDED HERE ===
  // We take the filtered list and sort it based on the 'selected' state
  const sortedListings = [...filteredListings].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);

    if (selected === "Lowest price") {
      return priceA - priceB; // Low to High
    }
    if (selected === "Highest price") {
      return priceB - priceA; // High to Low
    }
    // For "Newly listed" we return 0 (default order)
    return 0;
  });
  // =======================================
  
  const categoriesList = [
    { name: "Mobile Phones", count: 10},
    { name: "Cars", count: 6 },
    { name: "Bikes", count: 8 },
    { name: "Bicycles", count: 4 },
    { name: "Houses & Flats", count: 5 },
    { name: "Plots & Land", count: 6 },
    { name: "Furniture", count: 12 },
    { name: "Electronics & Home Appliances", count: 7 },
    { name: "Equipment & Tools", count: 11 },
    { name: "Fashion & Personal Items", count: 5 },
    { name: "Sports Equipment", count: 6 },
  ];


  return (
    <div className="relative">
    <div className="min-h-screen bg-gray-50 pt-[40px] pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {category ? `${category} in Pakistan` : query ? `Results for "${query}"` : "All Listings"}
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* === LEFT SIDEBAR === */}
          <aside className="w-full md:w-1/4 space-y-4">
            
            {/* Categories Filter */}
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Categories</h3>
              </div>
              <ul className="text-sm space-y-2">
                <li>
                  <Link 
                    href="/search" 
                    className={!category 
                      ? "font-bold text-blue-600 block" 
                      : "text-gray-600 hover:text-blue-500 block"
                    }
                  >
                    All Categories
                  </Link>
                </li>
                {categoriesList.map((cat) => (
                  <li key={cat.name} className="pl-4">
                    <Link 
                      href={`/search?category=${encodeURIComponent(cat.name)}${query ? `&query=${query}` : ''}`}
                      className={category === cat.name 
                        ? "font-bold text-blue-600 block" 
                        : "text-gray-600 hover:text-blue-500 block"
                      }
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location Filter */}
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Locations</h3>
              </div>
              
              <div className="relative">
                <div 
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 bg-white hover:border-blue-500 transition-colors cursor-pointer group"
                >
                  <FiMapPin className="text-gray-500 mr-2 text-lg group-hover:text-blue-500" />
                  <span className={`w-full text-sm ${selectedLocation === 'Pakistan' ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                    {selectedLocation}
                  </span>
                  <FiChevronDown className={`text-gray-500 ml-2 text-lg transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                </div>

                {isLocationOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                    {locations.map((loc) => (
                      <div 
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationOpen(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {["Lahore", "Karachi", "Islamabad"].map((city) => (
                   <p 
                     key={city} 
                     onClick={() => setSelectedLocation(city)}
                     className="cursor-pointer hover:text-blue-600 hover:bg-blue-50 p-1 rounded"
                   >
                     {city}
                   </p>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white p-4 rounded border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">Price Range</h3>
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border p-2 text-sm rounded bg-gray-50 focus:outline-none focus:border-blue-500" 
                />
                <span className="text-gray-800 font-medium text-sm">to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border p-2 text-sm rounded bg-gray-50 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

          </aside>

          {/* === RIGHT SIDE (Listings Grid) === */}
          <main className="w-full md:w-3/4">
            
            {/* Top Bar (Sort/View) */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-500">
                {/* 4. UPDATED to show sorted count */}
                {sortedListings.length} ads found  
              </span>
              
              {/* === 5. NEW SORT UI STARTS HERE === */}
              <div className="relative">
                {/* Trigger Button */}
                <div 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                >
                  <span>Sort by:</span>
                  <span className="font-bold">{selected}</span>
                  <FiChevronDown className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                </div>

                {/* Dropdown Menu */}
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                    {options.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setSelected(option);
                          setIsSortOpen(false); // Close menu
                        }}
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>{option}</span>
                        {/* Show checkmark if selected */}
                        {selected === option && (
                          <FiCheck className="text-black text-lg" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* === SORT UI ENDS HERE === */}

            </div>

            {/* Grid */}
            {sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 6. UPDATED to map over 'sortedListings' instead of 'filteredListings' */}
                {sortedListings.map((item) => (
                  <ListingCard key={item.id} data={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded border border-gray-200">
                <FiFilter className="mx-auto text-4xl text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">No ads found</h3>
              </div>
            )}
          </main>
         </div>
        </div>
      </div>
    </div>
  );
}