"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaCamera, FaMapMarkerAlt } from "react-icons/fa";

// 1. IMPORT TOAST AND OUR NEW MODAL
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";

// --- THE MASTER DICTIONARY ---
const CATEGORIES_DATA = [
  { name: "Mobiles", subcategories: ["Mobile Phones", "Power Bank", "Tablets", "Mobile Charger "] },
  { name: "Vehicles", subcategories: ["Cars", "Spare Parts"] },
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

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { data: session } = useSession();

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    contactNumber: "",
    address: "",
  });

  const [selectedMainCat, setSelectedMainCat] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");

  // IMAGE STATE
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // 2. MODAL STATE FOR DELETING IMAGES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const totalImagesCount = existingImages.length + newImageFiles.length;
  // --- LOCATION & MAP STATE ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocationSelected, setIsLocationSelected] = useState(true);

  // Load Google Maps Script
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

  // --- 1. FETCH EXISTING DATA ---
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/listings/${id}`);
        const result = await response.json();

        if (result.success) {
          const ad = result.data;
          setFormData({
            title: ad.title,
            description: ad.description,
            price: ad.price.toString(),
            contactNumber: ad.contactNumber,
            address: ad.address,
          });
          // Grab existing GPS coordinates if they exist
          if (ad.location && ad.location.coordinates?.length === 2) {
            setLng(ad.location.coordinates[0]); 
            setLat(ad.location.coordinates[1]);
          }
          setExistingImages(ad.images || []);

          const mainCategory = CATEGORIES_DATA.find(cat => cat.subcategories.includes(ad.category));
          if (mainCategory) {
            setSelectedMainCat(mainCategory.name);
            setSelectedSubCat(ad.category);
          } else {
            setSelectedMainCat(ad.category);
            setSelectedSubCat(ad.category);
          }
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching ad:", err);
        setError("Failed to load ad details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMainCat(e.target.value);
    setSelectedSubCat(""); 
  };

  // --- IMAGE HANDLERS ---
  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const incomingFiles = Array.from(files);
      const remainingSlots = 5 - totalImagesCount;

      const filesToKeep = incomingFiles.slice(0, remainingSlots);
      const newPreviews = filesToKeep.map(file => URL.createObjectURL(file));

      setNewImageFiles(prev => [...prev, ...filesToKeep]);
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
    e.target.value = "";
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // 3. SPLIT DELETE FUNCTION: Step A - Open Modal
  const confirmDeleteImage = (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setIsDeleteModalOpen(true);
  };

  // 3. SPLIT DELETE FUNCTION: Step B - Execute Deletion
  const executeDeleteExistingImage = async () => {
    if (!imageToDelete) return;

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      const response = await fetch(`http://localhost:5000/api/listings/${id}/images`, {
        method: "DELETE",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ imageUrl: imageToDelete }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setExistingImages(prev => prev.filter(img => img.url !== imageToDelete));
        toast.success("Image deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("An error occurred while deleting the image.");
    } finally {
      setImageToDelete(null); // Clean up
    }
  };

  // --- 2. SUBMIT UPDATES TO BACKEND ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLocationSelected) {
      toast.error("Please select a valid location from the dropdown suggestions.");
      return; 
    }
    setIsSubmitting(true);

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      const updatedData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        contactNumber: formData.contactNumber,
        address: formData.address,
        category: selectedSubCat || selectedMainCat, 
      };
      
      if (lat !== null && lng !== null) {
        updatedData.location = {
          type: "Point",
          coordinates: [lng, lat]
        };
      }

      const textResponse = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "PUT",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      const textResult = await textResponse.json();

      if (!textResponse.ok || !textResult.success) {
        toast.error(textResult.message || "Failed to update ad details (Profanity check failed?).");
        setIsSubmitting(false);
        return; 
      }

      if (newImageFiles.length > 0) {
        const imageFormData = new FormData();
        newImageFiles.forEach((file) => {
          imageFormData.append("images", file); 
        });

        const imageHeaders: HeadersInit = {};
        if (localToken) imageHeaders["Authorization"] = `Bearer ${localToken}`;
        else if (session?.user?.email) imageHeaders["x-google-email"] = session.user.email;

        const imageResponse = await fetch(`http://localhost:5000/api/listings/${id}/images`, {
          method: "POST",
          headers: imageHeaders,
          credentials: "include",
          body: imageFormData,
        });

        const imageResult = await imageResponse.json();

        if (!imageResponse.ok || !imageResult.success) {
          toast.error(imageResult.message || "Ad text updated, but new images were rejected by moderation.", { duration: 5000 });
        } else {
          toast.success("Ad details and images updated successfully!\n" + (imageResult.message || ""), { duration: 5000 });
        }
      } else {
        toast.success("Ad updated successfully!");
      }

      router.replace(`/listings/${id}`); 

    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("An error occurred while updating the ad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- REUSABLE STYLES ---
  const inputClasses = "w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:border-[#002f34] focus:ring-1 focus:ring-[#002f34]";
  const labelClasses = "block text-[15px] text-[#002f34] mb-2 font-semibold";

  if (isLoading) {
    return <div className="min-h-screen pt-32 text-center text-xl font-bold text-gray-500 animate-pulse">Loading ad details...</div>;
  }

  if (error) {
    return <div className="min-h-screen pt-32 text-center text-xl text-red-500">{error}</div>;
  }

  const activeMainCatData = CATEGORIES_DATA.find((c) => c.name === selectedMainCat);

  return (
    <ProtectedRoute>
      <div className="max-w-[800px] mx-auto p-5 pt-10 font-['Helvetica_Neue',_Arial,_sans-serif] min-h-screen pb-20">
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-[#002f34] mb-8 border-b pb-4">Edit Your Ad</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className={labelClasses}>Ad Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClasses} />
            </div>

            {/* Category Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Main Category</label>
                <select value={selectedMainCat} onChange={handleMainCatChange} required className={`${inputClasses} bg-white`}>
                  <option value="" disabled>Select Main Category</option>
                  {CATEGORIES_DATA.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Subcategory</label>
                <select value={selectedSubCat} onChange={(e) => setSelectedSubCat(e.target.value)} required disabled={!activeMainCatData} className={`${inputClasses} ${!activeMainCatData ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
                  <option value="" disabled>Select Subcategory</option>
                  {activeMainCatData?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={labelClasses}>Price per Day (PKR)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className={inputClasses} />
            </div>

            {/* Description */}
            <div>
              <label className={labelClasses}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className={`${inputClasses} min-h-[150px] resize-y`} />
            </div>

            {/* Location & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClasses}>Location / Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  autoComplete="off"
                  onFocus={() => setIsLocationOpen(true)} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, address: val }));
                    setIsLocationOpen(true);
                    setIsLocationSelected(false);

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
                  required 
                  className={inputClasses} 
                />
                
                {/* Autocomplete Dropdown WITH "Use Current Location" */}
                {isLocationOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                    
                    {/* --- USE CURRENT LOCATION BUTTON --- */}
                    <div 
                      onClick={() => {
                        setIsLocationOpen(false);
                        setIsLocationSelected(true);
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const currentLat = position.coords.latitude;
                              const currentLng = position.coords.longitude;
                              setLat(currentLat);
                              setLng(currentLng);
                              
                              const googleObj = (window as any).google;
                              if (googleObj && googleObj.maps) {
                                const geocoder = new googleObj.maps.Geocoder();
                                geocoder.geocode({ location: { lat: currentLat, lng: currentLng } }, (results: any, status: any) => {
                                  if (status === "OK" && results[0]) {
                                    const fullAddress = results[0].formatted_address;
                                    const firstPart = fullAddress.split(',')[0].trim();
                                    
                                    const cityObj = results[0].address_components?.find((c: any) => 
                                      c.types.includes("locality") || c.types.includes("administrative_area_level_2")
                                    );
                                    const cityName = cityObj ? cityObj.long_name : "";
                                    
                                    let finalAddress = firstPart;
                                    if (cityName && firstPart.toLowerCase() !== cityName.toLowerCase()) {
                                      finalAddress = `${firstPart}, ${cityName}`;
                                    }
                                    
                                    setFormData(prev => ({ ...prev, address: finalAddress }));
                                  } else {
                                    setFormData(prev => ({ ...prev, address: "Current Location" }));
                                  }
                                });
                              }
                            },
                            (error) => {
                              console.error("Error getting location", error);
                              toast.error("Please allow location access in your browser to use this feature.");
                            }
                          );
                        } else {
                          toast.error("Geolocation is not supported by your browser.");
                        }
                      }}
                      className="px-4 py-3 text-sm text-blue-600 font-bold hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center gap-2"
                    >
                     <FaMapMarkerAlt className="text-[#3b82f6] text-xl" />
                      Use Current Location
                    </div>

                    {/* --- TYPED SUGGESTIONS --- */}
                    {suggestions.map((loc) => (
                      <div 
                        key={loc}
                        onClick={() => {
                          setIsLocationOpen(false);
                          setIsLocationSelected(true);
                          
                          const googleObj = (window as any).google;
                          if (googleObj && googleObj.maps) {
                            const geocoder = new googleObj.maps.Geocoder();
                            geocoder.geocode({ address: loc }, (results: any, status: any) => {
                              if (status === "OK" && results[0]) {
                                setLat(results[0].geometry.location.lat());
                                setLng(results[0].geometry.location.lng());

                                const fullAddress = results[0].formatted_address;
                                const firstPart = fullAddress.split(',')[0].trim();
                                
                                const cityObj = results[0].address_components?.find((c: any) => 
                                  c.types.includes("locality") || c.types.includes("administrative_area_level_2")
                                );
                                const cityName = cityObj ? cityObj.long_name : "";
                                
                                let finalAddress = firstPart;
                                if (cityName && firstPart.toLowerCase() !== cityName.toLowerCase()) {
                                  finalAddress = `${firstPart}, ${cityName}`;
                                }
                                
                                setFormData(prev => ({ ...prev, address: finalAddress }));
                              } else {
                                setFormData(prev => ({ ...prev, address: loc }));
                              }
                            });
                          }
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer truncate"
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClasses}>Contact Number</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className={inputClasses} />
              </div>
            </div>

            {/* --- IMAGES SECTION --- */}
            <div className="pt-4 border-t">
              <label className={labelClasses}>Manage Images ({totalImagesCount}/5)</label>
              <p className="text-xs text-gray-500 mb-4">Click the 'X' to delete an existing image. Upload new ones below.</p>
              
              <div className="flex flex-wrap gap-4">
                
                {/* 1. Existing Images (From DB) */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-md border border-gray-200 group">
                    <img src={`http://localhost:5000${img.url}`} alt="Existing" className="w-full h-full object-cover rounded-md" />
                    <button 
                      type="button" 
                      onClick={() => confirmDeleteImage(img.url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center capitalize py-0.5 rounded-b-md">
                      {img.status}
                    </div>
                  </div>
                ))}

                {/* 2. New Images (To Upload) */}
                {newImagePreviews.map((imgUrl, idx) => (
                  <div key={`new-${idx}`} className="relative w-24 h-24 rounded-md border-2 border-blue-400 group">
                    <img src={imgUrl} alt="New Preview" className="w-full h-full object-cover rounded-md" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute -top-2 -right-2 bg-gray-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5 rounded-b-md">
                      New
                    </div>
                  </div>
                ))}

                {/* 3. Upload Button */}
                {totalImagesCount < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-500">
                    <FaCamera size={24} className="mb-1" />
                    <span className="text-[10px] font-semibold">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleNewImageUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-1/3 py-3 text-[#002f34] font-bold bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-2/3 py-3 text-white font-bold rounded-md transition-colors ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002f34] hover:bg-[#005861]'
                }`}
              >
                {isSubmitting ? "Saving Updates..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>

        {/* --- OUR NEW DELETE CONFIRMATION MODAL --- */}
        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={executeDeleteExistingImage}
          title="Delete Image"
          message="Are you sure you want to delete this image permanently? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isDestructive={true} // Automatically makes the confirm button red!
        />

      </div>
    </ProtectedRoute>
  );
}