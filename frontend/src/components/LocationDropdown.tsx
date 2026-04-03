"use client";
import React, { useState, useRef, useEffect } from "react";
import { FiMapPin, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

// 1. IMPORT TOAST
import toast from "react-hot-toast";

// Your Custom Beautiful Gradient Pin!
const GradientPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 shrink-0">
    <defs>
      <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c6ff" />
        <stop offset="100%" stopColor="#0072ff" />
      </linearGradient>
    </defs>
    <ellipse cx="12" cy="22" rx="7" ry="1.5" stroke="url(#pinGradient)" strokeWidth="1.5" fill="none"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C8.134 2 5 5.134 5 9C5 14.25 12 21 12 21C12 21 19 14.25 19 9C19 5.134 15.866 2 12 2ZM12 12.5C10.067 12.5 8.5 10.933 8.5 9C8.5 7.067 10.067 5.5 12 5.5C13.933 5.5 15.5 7.067 15.5 9C15.5 10.933 13.933 12.5 12 12.5Z" fill="url(#pinGradient)"/>
  </svg>
);

const LocationDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read location from URL if it exists, otherwise default to "Pakistan"
  const urlLocation = searchParams.get("location");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(urlLocation || "Pakistan");
  
  // --- State for Google Maps suggestions ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // 1. Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedLocation.trim() === "") setSelectedLocation("Pakistan");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLocation]);

  // 2. Load Google Maps Script secretly in the background
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser."); // REPLACED ALERT
      return;
    }

    setSelectedLocation("Locating...");
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Grab the Google key you are already using!
        const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
        
        try {
          if (googleKey) {
            // CALLING THE GOOGLE MAPS GEOCODING API
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
              // Google returns an array of "address_components"
              const components = data.results[0].address_components;

              let exactArea = "";
              let city = "";

              // 1. Look for the neighborhood, street, or specific sub-area
              const areaObj = components.find((c: any) => 
                c.types.includes("sublocality") || 
                c.types.includes("neighborhood") || 
                c.types.includes("route")
              );
              if (areaObj) exactArea = areaObj.long_name;

              // 2. Look for the main city
              const cityObj = components.find((c: any) => c.types.includes("locality"));
              if (cityObj) city = cityObj.long_name;

              // 3. Combine them beautifully (e.g., "Model Town, Gujrat")
              let displayName = "Current Location";
              if (exactArea && city && exactArea !== city) {
                displayName = `${exactArea}, ${city}`;
              } else if (exactArea || city) {
                displayName = exactArea || city;
              } else {
                // If all else fails, just use Google's formatted address
                displayName = data.results[0].formatted_address;
              }
              
              setSelectedLocation(displayName); 
            } else {
              setSelectedLocation("Current Location"); 
            }
          } else {
            console.error("Missing Google Maps API Key");
            setSelectedLocation("Current Location"); 
          }
        } catch (error) {
          console.error("Google Geocoding failed:", error);
          setSelectedLocation("Current Location");
        }

        setIsOpen(false);
        const params = new URLSearchParams(window.location.search);
        params.delete("location"); // Clear text location
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        router.push(`/search?${params.toString()}`);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Please allow location access in your browser to use this feature."); // REPLACED ALERT
          setSelectedLocation("Pakistan"); 
        }
      },
      options
    );
  };

  const handleSeeAllPakistan = () => {
    setSelectedLocation("Pakistan");
    setIsOpen(false);

    const params = new URLSearchParams(window.location.search);
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    params.delete("location");

    router.push(`/search?${params.toString()}`);
  };

  const handleSelectCity = (city: string) => {
    setSelectedLocation(city);
    setIsOpen(false);

    const params = new URLSearchParams(window.location.search);
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    params.set("location", city); 

    router.push(`/search?${params.toString()}`);
  };

  // --- Only show Google suggestions ---
  const isTyping = selectedLocation.trim() !== "" && selectedLocation !== "Pakistan";
  const displayList = suggestions; // No more popular cities!

  // --- UPDATED: Block "Enter" key if the text is not a valid suggestion! ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Stop standard behavior
      // Only proceed if what they typed exactly matches an item in the list
      if (displayList.includes(selectedLocation)) {
        handleSelectCity(selectedLocation);
      }
    }
  };

  return (
   <div className="relative w-full md:w-[256px]" ref={dropdownRef}>
      
      {/* 1. THE VISIBLE BOX */}
      <div 
  onClick={() => setIsOpen(true)}
className="flex items-center border border-black-300 rounded-lg px-3 w-full md:w-[256px] bg-white h-10 transition hover:border-[#0077ff] cursor-text"
>
        <GradientPinIcon />
        <input
          type="text"
          value={selectedLocation}
          onKeyDown={handleKeyDown}
          placeholder="Select or type location"
          className="flex-1 min-w-0 text-sm border-none focus:outline-none bg-transparent text-gray-900"
          
          onChange={(e) => {
            const val = e.target.value;
            setSelectedLocation(val);
            setIsOpen(true);

            if (val.trim() === "") {
              setSuggestions([]);
              return;
            }

            const googleObj = (window as any).google;
            if (googleObj && googleObj.maps && googleObj.maps.places) {
              const service = new googleObj.maps.places.AutocompleteService();
              service.getPlacePredictions({
                input: val,
                componentRestrictions: { country: "pk" }, // 1. Restrict to Pakistan only
                // 2. Notice there is NO "types" line here! 
                // By leaving it empty, Google searches for every street, shop, and city.
              }, (predictions: any, status: any) => {
                if (status === googleObj.maps.places.PlacesServiceStatus.OK && predictions) {
                  setSuggestions(predictions.map((p: any) => p.description));
                } else {
                  setSuggestions([]);
                }
              });
            }
          }}
        />
        <span 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="ml-2 text-gray-700 flex items-center justify-center cursor-pointer"
        >
          {isOpen ? <FiChevronUp className="text-black text-lg" /> : <FiChevronDown className="text-black text-lg" />}
        </span>
      </div>

      {/* 2. THE DROPDOWN MENU */}
      {isOpen && (
       <div className="absolute top-full left-0 mt-1 w-full md:w-[350px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div onClick={handleUseCurrentLocation} className="flex items-center cursor-pointer text-[#3b82f6] hover:opacity-80 transition-opacity">
              <GradientPinIcon />
              <span className="font-bold text-sm">Use Current Location</span>
            </div>
            <div onClick={handleSeeAllPakistan} className="cursor-pointer text-[#002f34] font-bold text-sm hover:underline">
              See all in Pakistan
            </div>
          </div>

         {/* LOCATIONS LIST */}
          <div className="p-2">
            {isTyping && displayList.length > 0 && (
              <p className="text-xs text-black-400 font-semibold px-2 py-2 uppercase tracking-wider">
                Google Suggestions
              </p>
            )}
            <div className="mt-1 max-h-48 overflow-y-auto">
              
              {displayList.length > 0 ? (
                /* Show either Popular Cities or Google Suggestions */
                displayList.map((city) => (
                  <div 
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-[#0077ff] rounded text-sm text-gray-700 transition"
                  >
                    <FiMapPin className="text-black-400" />
                    {city}
                  </div>
                ))
              ) : (
                /* UPDATED: If Google finds nothing, just show unclickable text! */
                selectedLocation.trim() !== "" && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No matching locations found.
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;