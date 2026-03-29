"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { FiChevronDown, FiFilter, FiMapPin, FiCheck } from "react-icons/fi";

const CATEGORIES_DATA = [
  { name: "Mobiles", subcategories: ["Mobile Phones", "Power Bank", "Tablets", "Mobile Charger "] },
  { name: "Vehicles", subcategories: ["Cars", "Motorcycles", "Bicycles", "Spare Parts"] },
  { name: "Property for Rent", subcategories: ["Houses", "Apartments", "Rooms", "Shop", "Office"] },
  { name: "Electronics & Home Appliances", subcategories: ["Computers", "TVs", "Kitchen Appliances", "Cameras", "AC & Coolers", "Smart Home Device", "Genrator & Ups"] },
  { name: "Bikes", subcategories: ["Motorcycles", "Scooters", "Spare Parts", "Bicycles", "Bike Acessories"] },
  { name: "Business, Industrial & Agriculture", subcategories: ["Machinery", "Tractors", "Medical & Lab Equipment", "Agriculture Tools"] },
  { name: "Furniture & Home Decor", subcategories: ["Sofa & Chairs", "Beds & Wardrobes", "Tables", "Office Furniture", "Decor"] },
  { name: "Fashion & Beauty", subcategories: ["Men", "Women", "Kids Clothing", "Accessories", "Watches", "Beauty Products"] },
  { name: "Books, Sports & Hobbies", subcategories: ["Books", "Musical Instruments", "Sports Equipment", "Gym & Fitness"] },
  { name: "Outdoor Equipment", subcategories: ["Camping", "Hiking", "Fishing", "Skiing"] },
  { name: "Other", subcategories: ["Miscellaneous", "Events"] }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("query");
  const locationParam = searchParams.get("location");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  // This is the Haversine formula! It calculates actual kilometers between two GPS pins.
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };
  const [realListings, setRealListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // NEW STATE: Manage which category in the sidebar is expanded
  const [expandedSidebarCats, setExpandedSidebarCats] = useState<string[]>([]);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Newly listed");
  const [selectedLocation, setSelectedLocation] = useState(locationParam || "Pakistan");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const sortOptions = ["Newly listed", "Lowest price", "Highest price"];
 useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).google) {
      const scriptId = "google-maps-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
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

  // Automatically expand the sidebar category family if the user lands on it from the homepage
  useEffect(() => {
    if (categoryParam) {
      const family = CATEGORIES_DATA.find(c => c.name === categoryParam || c.subcategories.includes(categoryParam));
      if (family && !expandedSidebarCats.includes(family.name)) {
        setExpandedSidebarCats(prev => [...prev, family.name]);
      }
    }
  }, [categoryParam]);

  const toggleSidebarCat = (catName: string) => {
    setExpandedSidebarCats(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const filteredListings = realListings.map((item: any) => {
    // 1. First, calculate distance if GPS is active
    let distance = Infinity;
    if (latParam && lngParam && item.location?.coordinates?.length === 2) {
      const itemLng = item.location.coordinates[0]; 
      const itemLat = item.location.coordinates[1];
      distance = calculateDistance(parseFloat(latParam), parseFloat(lngParam), itemLat, itemLng);
    }
    return { ...item, distance }; 

  }).filter((item: any) => {
    // 2. Category & Query Filters
    let validSubcategories: string[] = [];
    if (categoryParam) {
      const mainCatMatch = CATEGORIES_DATA.find(c => c.name === categoryParam);
      if (mainCatMatch) {
        validSubcategories = mainCatMatch.subcategories;
      } else {
        validSubcategories = [categoryParam];
      }
    }
    const matchCategory = validSubcategories.length > 0 ? validSubcategories.includes(item.category) || item.category === categoryParam : true; 
    const matchQuery = queryParam ? item.title.toLowerCase().includes(queryParam.toLowerCase()) || item.category.toLowerCase().includes(queryParam.toLowerCase()) : true;
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    const matchPrice = item.price >= min && item.price <= max;

    // 3. Location Filter
    let matchLocation = true;
   if (latParam && lngParam) {
      matchLocation = true; 
    } else {
      // If NO GPS is used, run the Highly Forgiving Text Match
      const activeLocation = locationParam || selectedLocation || "Pakistan";
      if (activeLocation !== "Pakistan" && activeLocation !== "") {
        const dbAddr = (item.address || "").toLowerCase();
        const searchAddr = activeLocation.toLowerCase();
        
        if (dbAddr.includes(searchAddr) || searchAddr.includes(dbAddr)) {
          matchLocation = true;
        } else {
          const searchParts = searchAddr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "pakistan" && s !== "");
          const dbParts = dbAddr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "pakistan" && s !== "");
          matchLocation = searchParts.some((searchPart: string) => dbParts.some((dbPart: string) => dbPart.includes(searchPart) || searchPart.includes(dbPart)));
        }
      }
    }

    return matchCategory && matchQuery && matchLocation && matchPrice; 
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    // 1. PRICE TAKES PRIORITY: If the user explicitly chose a price filter, respect it first!
    if (selectedSort === "Lowest price") return a.price - b.price;
    if (selectedSort === "Highest price") return b.price - a.price;

    // 2. GPS FALLBACK: If they didn't choose a price filter, AND GPS is active, sort by nearest
    if (latParam && lngParam) {
      return a.distance - b.distance; 
    }

    // 3. DEFAULT: If no GPS and no price filter, sort by Newly Listed
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getSubcategoryCount = (subCatName: string) => {
    return realListings.filter(item => item.category === subCatName).length;
  };

  return (
    <div className="relative">
      <div className="min-h-screen bg-gray-50 pt-[40px] pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {categoryParam ? `${categoryParam} in Pakistan` : queryParam ? `Results for "${queryParam}"` : "All Listings"}
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* === LEFT SIDEBAR === */}
            <aside className="w-full md:w-1/4 space-y-4">
              
              {/* Nested Categories Filter */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Categories</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li className="mb-3">
                    <Link 
                      href="/search" 
                      className={!categoryParam ? "font-bold text-blue-600 block" : "text-gray-800 font-bold hover:text-blue-500 block"}
                    >
                      All Categories
                    </Link>
                  </li>
                  
                  {CATEGORIES_DATA.map((mainCat) => {
                    const isMainActive = categoryParam === mainCat.name;
                    const isExpanded = expandedSidebarCats.includes(mainCat.name);

                    return (
                      <li key={mainCat.name} className="mt-1">
                        <div className="flex justify-between items-center py-1.5 rounded-md transition-colors hover:bg-gray-50">
                          {/* Main Category Link */}
                          <Link 
                            href={`/search?category=${encodeURIComponent(mainCat.name)}${queryParam ? `&query=${queryParam}` : ''}`}
                            className={`block flex-grow font-semibold ${isMainActive ? "text-blue-600" : "text-gray-700 hover:text-blue-500"}`}
                          >
                            {mainCat.name}
                          </Link>
                          
                          {/* The Arrow toggles the subcategories */}
                          <button 
                            onClick={() => toggleSidebarCat(mainCat.name)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-full"
                          >
                            <FiChevronDown className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} size={16} />
                          </button>
                        </div>
                        
                        {/* Subcategories (Accordion Style) */}
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                          <ul className="overflow-hidden pl-4 mt-1 border-l-2 border-blue-100 ml-2 space-y-1">
                            {mainCat.subcategories.map(subCat => {
                              const count = getSubcategoryCount(subCat);
                              return (
                                <li key={subCat}>
                                  <Link 
                                    href={`/search?category=${encodeURIComponent(subCat)}${queryParam ? `&query=${queryParam}` : ''}`}
                                    className={`block text-[13px] py-1 px-2 rounded-md hover:bg-blue-50/50 ${categoryParam === subCat ? "text-blue-600 font-bold" : "text-gray-500 hover:text-blue-600"}`}
                                  >
                                    {subCat} <span className="text-gray-400">({count})</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

             {/* Location Filter */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Locations</h3>
                </div>
                <div className="relative">
                  {/* Now an input field so they can type! */}
                  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white focus-within:border-blue-500 transition-colors">
                    <FiMapPin className="text-gray-500 mr-2 text-lg" />
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedLocation(val);
                        setIsLocationOpen(true);

                        if (val.trim() === "") {
                          setSuggestions([]);
                          return;
                        }

                        const googleObj = (window as any).google;
                        if (googleObj && googleObj.maps && googleObj.maps.places) {
                          const service = new googleObj.maps.places.AutocompleteService();
                          service.getPlacePredictions({
                            input: val,
                            componentRestrictions: { country: "pk" },
                          }, (predictions: any, status: any) => {
                            if (status === googleObj.maps.places.PlacesServiceStatus.OK && predictions) {
                              setSuggestions(predictions.map((p: any) => p.description));
                            } else {
                              setSuggestions([]);
                            }
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        // When they press enter, it pushes the typed location to the URL!
                        if (e.key === "Enter") {
                          setIsLocationOpen(false);
                          const params = new URLSearchParams(window.location.search);
                          params.set("location", selectedLocation);
                          window.history.pushState({}, "", `?${params.toString()}`);
                        }
                      }}
                      placeholder="Select or type location"
                      className="w-full text-sm outline-none text-gray-900 bg-transparent"
                    />
                    <FiChevronDown 
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                      className={`text-gray-500 ml-2 text-lg transition-transform cursor-pointer ${isLocationOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                  
                  {/* The Dropdown List for the sidebar */}
                  {isLocationOpen && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                      {suggestions.map((loc) => (
                        <div 
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setIsLocationOpen(false);
                            const params = new URLSearchParams(window.location.search);
                            params.set("location", loc);
                            window.history.pushState({}, "", `?${params.toString()}`);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2"
                        >
                          <FiMapPin className="text-gray-400 shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Price Range</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border p-2 text-sm rounded bg-gray-50 focus:outline-none focus:border-blue-500" />
                  <span className="text-gray-800 font-medium text-sm">to</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border p-2 text-sm rounded bg-gray-50 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

            </aside>

            {/* === RIGHT SIDE (Listings Grid) === */}
            <main className="w-full md:w-3/4">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-500">
                  {isLoading ? "Loading..." : `${sortedListings.length} ads found`}
                </span>
                <div className="relative">
                  <div onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                    <span>Sort by:</span><span className="font-bold">{selectedSort}</span>
                    <FiChevronDown className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                      {sortOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => { setSelectedSort(option); setIsSortOpen(false); }}
                          className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <span>{option}</span>
                          {selectedSort === option && <FiCheck className="text-black text-lg" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading listings...</div>
              ) : sortedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedListings.map((item) => (
                    <ListingCard key={item._id} data={item} />
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