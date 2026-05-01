"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import { FiChevronDown, FiFilter, FiMapPin, FiCheck } from "react-icons/fi";

const CATEGORIES_DATA = [
  { name: "Mobiles", subcategories: ["Mobile Phones", "Power Bank", "Tablets", "Mobile Charger "] },
  { name: "Vehicles", subcategories: ["Cars", "Spare Parts"] },
  { name: "Property for Rent", subcategories: ["Houses", "Apartments", "Rooms", "Shop", "Office"] },
  { name: "Electronics & Home Appliances", subcategories: ["Computers", "TVs", "Kitchen Appliances", "Cameras", "AC & Coolers", "Smart Home Device", "Genrator & Ups"] },
  { name: "Bikes", subcategories: ["Motorcycles", "Scooters", "Bicycles"] },
  { name: "Agriculture Machinery & Tools", subcategories: ["Machinery", "Tractors", "Agriculture Tools"] },
  { name: "Furniture & Home Decor", subcategories: ["Sofa & Chairs", "Beds & Wardrobes", "Tables", "Office Furniture", "Decor"] },
  { name: "Fashion & Beauty", subcategories: ["Men", "Women", "Kids Clothing", "Accessories", "Watches", "Beauty Products"] },
  { name: "Books, Sports & Hobbies", subcategories: ["Books", "Musical Instruments", "Sports Equipment", "Gym & Fitness"] },
  { name: "Outdoor Equipment", subcategories: ["Camping", "Hiking", "Fishing", "Skiing"] },
  { name: "Other", subcategories: ["Miscellaneous"] }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("query");
  const locationParam = searchParams.get("location");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const [realListings, setRealListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // NEW STATE: Manage which category in the sidebar is expanded
  const [expandedSidebarCats, setExpandedSidebarCats] = useState<string[]>([]);

  const [isSortOpen, setIsSortOpen] = useState(false);
 const [selectedSort, setSelectedSort] = useState(
    latParam && lngParam && (queryParam || categoryParam) ? "" : "Newly listed"
  );
  const [selectedLocation, setSelectedLocation] = useState(locationParam || "Pakistan");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
 const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
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
        const params = new URLSearchParams();
        let finalCategory = categoryParam;
        let finalQuery = queryParam;

        // 🧠 SMART SEARCH: If user typed "Vehicles", treat it like a category!
        if (queryParam && !categoryParam) {
          const matchedMainCat = CATEGORIES_DATA.find(c => c.name.toLowerCase() === queryParam.toLowerCase());
          if (matchedMainCat) {
            finalCategory = matchedMainCat.name;
            finalQuery = null; // Clear keyword, use category instead
          }
        }

        if (finalQuery) params.append("keyword", finalQuery);
       if (latParam) params.append("lat", latParam);
if (lngParam) params.append("lng", lngParam);

        // 🛡️ SUBCATEGORY PROTECTION: Don't send "Vehicles" to DB, only send "Cars"
        if (finalCategory) {
          const isMainCategory = CATEGORIES_DATA.some(c => c.name === finalCategory);
          if (!isMainCategory) {
            params.append("category", finalCategory); 
          }
        }

        let fetchUrl = "http://localhost:5000/api/listings";
        if (params.toString()) {
          fetchUrl = `http://localhost:5000/api/listings/search?${params.toString()}`; 
        }

        const response = await fetch(fetchUrl);
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
  }, [queryParam, latParam, lngParam, categoryParam, locationParam]); 

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
  let autoLocationText = "";
  if (latParam && lngParam && !locationParam && realListings.length > 0) {
    autoLocationText = realListings[0].address || "";
  }

  const filteredListings = realListings.filter((item: any) => {
    
    let finalCategory = categoryParam;
    let finalQuery = queryParam;

    // 🧠 SMART SEARCH AGAIN (For the frontend filter)
    if (queryParam && !categoryParam) {
      const matchedMainCat = CATEGORIES_DATA.find(c => c.name.toLowerCase() === queryParam.toLowerCase());
      if (matchedMainCat) {
        finalCategory = matchedMainCat.name;
        finalQuery = null;
      }
    }

    // 🛡️ CATEGORY FILTER: Safely group "Cars" and "Motorcycles" into "Vehicles"
    let matchCategory = true;
    if (finalCategory) {
      const mainCatMatch = CATEGORIES_DATA.find(c => c.name === finalCategory);
      if (mainCatMatch) {
        // It is a main category like "Vehicles", so check its subcategories!
        matchCategory = mainCatMatch.subcategories.includes(item.category) || item.category === finalCategory;
      } else {
        // It is a specific subcategory like "Cars"
        matchCategory = item.category === finalCategory;
      }
    }

    const matchQuery = finalQuery ? item.title.toLowerCase().includes(finalQuery.toLowerCase()) || item.category.toLowerCase().includes(finalQuery.toLowerCase()) : true;
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    const matchPrice = item.price >= min && item.price <= max;

   // 3. Location Filter (Strict City Match, NO Radius)
    let matchLocation = true;
    if (!queryParam && !categoryParam) {
    
    // This safely grabs "Lahore" whether it came from the dropdown or the GPS button!
    const activeLocation = locationParam || autoLocationText || selectedLocation || "Pakistan";
    
    if (activeLocation !== "Pakistan" && activeLocation !== "") {
      const dbAddr = (item.address || "").toLowerCase();
      const searchAddr = activeLocation.toLowerCase();
      

      const searchParts = searchAddr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "pakistan" && s !== "");
       const dbParts = dbAddr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "pakistan" && s !== "");
       
  
       matchLocation = searchParts.every((searchPart: string) => 
         dbParts.some((dbPart: string) => dbPart.includes(searchPart) || searchPart.includes(dbPart))
       );
     }
   }
   const matchStatus = item.status !== "pending";
   return matchCategory && matchQuery && matchLocation && matchPrice && matchStatus; 

 });

  const sortedListings = [...filteredListings].sort((a, b) => {
    // 1. PRICE TAKES PRIORITY: If the user explicitly chose a price filter, respect it first!
    if (selectedSort === "Lowest price") return a.price - b.price;
    if (selectedSort === "Highest price") return b.price - a.price;
    if (selectedSort === "Newly listed") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (latParam && lngParam && (queryParam || categoryParam)) {
      return 0; 
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getSubcategoryCount = (subCatName: string) => {
    return realListings.filter(item => item.category === subCatName).length;
  };
  const getCategoryUrl = (catName: string) => {
    const params = new URLSearchParams();
    if (catName) params.set("category", catName);
    if (queryParam) params.set("query", queryParam);
    if (locationParam) params.set("location", locationParam);
    if (latParam) params.set("lat", latParam);
    if (lngParam) params.set("lng", lngParam);
    return `/search?${params.toString()}`;
  };

 return (
    <div className="relative">
      <div className="min-h-screen bg-gray-50 pt-[70px] md:pt-[40px] pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              {categoryParam ? `${categoryParam}` : queryParam ? `"${queryParam}"` : "All Listings"}
            </h1>
            
            {/* OLX-STYLE HORIZONTAL FILTER BAR (MOBILE ONLY) */}
            <div className="md:hidden relative z-30">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden">
                
                {/* Category Pill */}
                <button onClick={() => setActiveFilterModal(activeFilterModal === 'category' ? null : 'category')} className={`shrink-0 snap-start flex items-center gap-1 border rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeFilterModal === 'category' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}`}>
                  {categoryParam || "All Categories"} <FiChevronDown className={activeFilterModal === 'category' ? 'rotate-180' : ''} />
                </button>

                {/* Price Pill */}
                <button onClick={() => setActiveFilterModal(activeFilterModal === 'price' ? null : 'price')} className={`shrink-0 snap-start flex items-center gap-1 border rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeFilterModal === 'price' || minPrice || maxPrice ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}`}>
                  {minPrice || maxPrice ? `Rs ${minPrice || 0} - ${maxPrice || 'Max'}` : "Price"} <FiChevronDown className={activeFilterModal === 'price' ? 'rotate-180' : ''} />
                </button>

                {/* Location Pill */}
                <button onClick={() => setActiveFilterModal(activeFilterModal === 'location' ? null : 'location')} className={`shrink-0 snap-start flex items-center gap-1 border rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeFilterModal === 'location' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}`}>
                  {selectedLocation !== "Pakistan" ? selectedLocation : "Location"} <FiChevronDown className={activeFilterModal === 'location' ? 'rotate-180' : ''} />
                </button>
              </div>

             {/* --- DROPDOWN MODALS --- */}
              
              {/* PRICE MODAL */}
              {activeFilterModal === 'price' && (
                <div className="absolute top-full left-0 w-[90vw] max-w-[350px] bg-white border border-gray-200 rounded-lg shadow-xl p-4 mt-1 z-50">
                  <h3 className="font-bold text-gray-800 mb-3">Set Price</h3>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border p-2 text-sm rounded focus:border-blue-500 outline-none bg-gray-50" />
                    <span className="text-gray-500">to</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border p-2 text-sm rounded focus:border-blue-500 outline-none bg-gray-50" />
                  </div>
                  <button onClick={() => setActiveFilterModal(null)} className="mt-4 w-full bg-[#0077ff] hover:bg-blue-700 text-white py-2 rounded-md font-bold transition-colors">Apply Price</button>
                </div>
              )}

              {/* LOCATION MODAL (This was missing!) */}
              {activeFilterModal === 'location' && (
                <div className="absolute top-full left-0 w-[90vw] max-w-[350px] bg-white border border-gray-200 rounded-lg shadow-xl p-4 mt-1 z-50">
                  <h3 className="font-bold text-gray-800 mb-3">Location</h3>
                  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white focus-within:border-blue-500 transition-colors">
                    <FiMapPin className="text-gray-500 mr-2 text-lg" />
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedLocation(val);
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
                        if (e.key === "Enter") {
                          setActiveFilterModal(null);
                          const params = new URLSearchParams(window.location.search);
                          params.set("location", selectedLocation);
                          window.history.pushState({}, "", `?${params.toString()}`);
                        }
                      }}
                      placeholder="Type location..."
                      className="w-full text-sm outline-none text-gray-900 bg-transparent"
                    />
                  </div>
                  
                  {/* Location Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-md">
                      {suggestions.map((loc) => (
                        <div 
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setActiveFilterModal(null);
                            const params = new URLSearchParams(window.location.search);
                            params.set("location", loc);
                            window.history.pushState({}, "", `?${params.toString()}`);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2 border-b border-gray-50 last:border-0"
                        >
                          <FiMapPin className="text-gray-400 shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CATEGORY MODAL (Now with Subcategories!) */}
              {activeFilterModal === 'category' && (
                <div className="absolute top-full left-0 w-[90vw] max-w-[300px] bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-[60vh] overflow-y-auto z-50">
                  <Link href="/search" onClick={() => setActiveFilterModal(null)} className="block p-4 text-sm font-bold text-blue-600 border-b border-gray-100 bg-gray-50">
                    All Categories
                  </Link>
                  {CATEGORIES_DATA.map(mainCat => {
                    const isExpanded = expandedSidebarCats.includes(mainCat.name);
                    return (
                      <div key={mainCat.name} className="border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-center p-4 hover:bg-gray-50">
                          <Link 
                            href={`/search?category=${encodeURIComponent(mainCat.name)}`} 
                            onClick={() => setActiveFilterModal(null)}
                            className="font-bold text-gray-800 text-sm flex-grow"
                          >
                            {mainCat.name}
                          </Link>
                          <button onClick={() => toggleSidebarCat(mainCat.name)} className="p-1">
                            <FiChevronDown className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        
                        {/* The Subcategories Dropdown */}
                        {isExpanded && (
                          <div className="bg-gray-50 pl-4 py-2 border-t border-gray-100">
                            {mainCat.subcategories.map(subCat => (
                              <Link
                                key={subCat}
                                href={`/search?category=${encodeURIComponent(subCat)}`}
                                onClick={() => setActiveFilterModal(null)}
                                className="block py-2 px-4 text-sm text-gray-600 hover:text-blue-600"
                              >
                                {subCat}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
           </div>
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* === LEFT SIDEBAR === */}
          <aside className="hidden md:block w-full md:w-1/4 space-y-4">
              
              {/* Nested Categories Filter */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Categories</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li className="mb-3">
                    <Link href={getCategoryUrl("")} className={!categoryParam ? "font-bold text-blue-600 block" : "text-gray-800 font-bold hover:text-blue-500 block"}>
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
    href={getCategoryUrl(mainCat.name)}
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
    href={getCategoryUrl(subCat)}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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