"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaCamera } from "react-icons/fa";

// --- THE MASTER DICTIONARY ---
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

  const totalImagesCount = existingImages.length + newImageFiles.length;

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

  const handleDeleteExistingImage = async (imageUrl: string) => {
    if (!window.confirm("Delete this image permanently?")) return;

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      // Ping backend DELETE image route
      const response = await fetch(`http://localhost:5000/api/listings/${id}/images`, {
        method: "DELETE",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Remove from UI instantly
        setExistingImages(prev => prev.filter(img => img.url !== imageUrl));
      } else {
        alert(result.message || "Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("An error occurred while deleting the image.");
    }
  };

  // --- 2. SUBMIT UPDATES TO BACKEND ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      // 1. UPDATE TEXT DATA (Checks against backend textFilter)
      const updatedData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        contactNumber: formData.contactNumber,
        address: formData.address,
        category: selectedSubCat || selectedMainCat, 
      };

      const textResponse = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "PUT",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      const textResult = await textResponse.json();

      if (!textResponse.ok || !textResult.success) {
        alert(textResult.message || "Failed to update ad details (Profanity check failed?).");
        setIsSubmitting(false);
        return; // Stop here if text validation failed!
      }

      // 2. UPLOAD NEW IMAGES (Checks against backend AI Moderation)
      if (newImageFiles.length > 0) {
        const imageFormData = new FormData();
        newImageFiles.forEach((file) => {
          imageFormData.append("images", file); 
        });

        // Don't set Content-Type for FormData, the browser handles the boundaries automatically
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
          alert(imageResult.message || "Ad text updated, but new images were rejected by moderation.");
        } else {
          // If images had mixed statuses, backend might return a specific message
          alert("Ad details and images updated successfully!\n" + (imageResult.message || ""));
        }
      } else {
        alert("Ad updated successfully!");
      }

      router.replace(`/listings/${id}`); 

    } catch (error) {
      console.error("Error updating ad:", error);
      alert("An error occurred while updating the ad.");
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
              <div>
                <label className={labelClasses}>Location / Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputClasses} />
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
                      onClick={() => handleDeleteExistingImage(img.url)}
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
      </div>
    </ProtectedRoute>
  );
}