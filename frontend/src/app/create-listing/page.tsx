"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FiSmartphone,
  FiHome,
  FiChevronRight
} from "react-icons/fi";
import { FaCarSide, FaCouch, FaFootballBall, FaEllipsisH, FaCamera } from "react-icons/fa";
import { GiHammerNails, GiClothes } from "react-icons/gi";
import { TbBike } from "react-icons/tb";
import { MdOutlineDevices } from "react-icons/md";

// --- MASTER DICTIONARY (Synced with Homepage/Search) ---
const CATEGORIES = [
  { id: "mobiles", name: "Mobiles", icon: <FiSmartphone />, color: "#ffce32", subcategories: ["Mobile Phones", "Power Bank", "Tablets", "Mobile Charger "] },
  { id: "vehicles", name: "Vehicles", icon: <FaCarSide />, color: "#23e5db", subcategories: ["Cars", "Motorcycles", "Bicycles", "Spare Parts"] },
  { id: "property", name: "Property for Rent", icon: <FiHome />, color: "#3d96ff", subcategories: ["Houses", "Apartments", "Rooms", "Shop", "Office"] },
  { id: "electronics", name: "Electronics & Home Appliances", icon: <MdOutlineDevices />, color: "#ffce32", subcategories: ["Computers", "TVs", "Kitchen Appliances", "Cameras", "AC & Coolers", "Smart Home Device", "Genrator & Ups"] },
  { id: "bikes", name: "Bikes", icon: <TbBike />, color: "#23e5db", subcategories: ["Motorcycles", "Scooters", "Spare Parts", "Bicycles", "Bike Acessories"] },
  { id: "business", name: "Business, Industrial & Agriculture", icon: <GiHammerNails />, color: "#3d96ff", subcategories: ["Machinery", "Tractors", "Medical & Lab Equipment", "Agriculture Tools"] },
  { id: "furniture", name: "Furniture & Home Decor", icon: <FaCouch />, color: "#ff563f", subcategories: ["Sofa & Chairs", "Beds & Wardrobes", "Tables", "Office Furniture", "Decor"] },
  { id: "fashion", name: "Fashion & Beauty", icon: <GiClothes />, color: "#23e5db", subcategories: ["Men", "Women", "Kids Clothing", "Accessories", "Watches", "Beauty Products"] },
  { id: "sports", name: "Books, Sports & Hobbies", icon: <FaFootballBall />, color: "#ffce32", subcategories: ["Books", "Musical Instruments", "Sports Equipment", "Gym & Fitness"] },
  { id: "outdoor", name: "Outdoor Equipment", icon: <FiHome />, color: "#ff563f", subcategories: ["Camping", "Hiking", "Fishing", "Skiing"] },
  { id: "other", name: "Other", icon: <FaEllipsisH />, color: "#3d96ff", subcategories: ["Miscellaneous", "Events"] },
];

export default function CreateListingPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMainCatId, setSelectedMainCatId] = useState<string>("");
  const [finalCategory, setFinalCategory] = useState({ main: "", sub: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    contactNumber: "",
    location: "",
  });

  const handleImageDelete = (indexToDelete: number) => {
    setImageFiles((current) => current.filter((_, index) => index !== indexToDelete));
    setImagePreviews((current) => current.filter((_, index) => index !== indexToDelete));
  };

  const handleMainCatClick = (id: string) => {
    setSelectedMainCatId(id);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSidebarClick = (id: string) => {
    setSelectedMainCatId(id);
  };

  const handleSubCatClick = (sub: string) => {
    const mainCatName = CATEGORIES.find((c) => c.id === selectedMainCatId)?.name || "";
    setFinalCategory({ main: mainCatName, sub: sub });
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews: string[] = [];
      const filesToKeep: File[] = [];
      
      const remainingSlots = 5 - imageFiles.length; 

      for (let i = 0; i < newFiles.length; i++) {
        if (i >= remainingSlots) break;
        const file = newFiles[i];
        filesToKeep.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
      
      setImageFiles((prev) => [...prev, ...filesToKeep]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const localToken = localStorage.getItem("token"); 
      
      if (!localToken && !session) {
        throw new Error("You must be logged in to post an ad.");
      }

      let coordinates = [74.3587, 31.5204]; 
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
        }
      } catch (geoError) {
        console.warn("Could not geocode location, using default.", geoError);
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: finalCategory.sub, 
        contactNumber: formData.contactNumber,
        address: formData.location, 
        location: {
          type: "Point",
          coordinates: coordinates 
        }
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (localToken) {
        headers["Authorization"] = `Bearer ${localToken}`;
      } else if (session?.user?.email) {
        headers["x-google-email"] = session.user.email; 
      }

      // 1. POST TEXT DATA
      const textResponse = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: headers,
        credentials: "include", 
        body: JSON.stringify(listingData),
      });

      const textResult = await textResponse.json();

      if (!textResponse.ok) {
        throw new Error(textResult.message || "Failed to save listing details.");
      }

      const newListingId = textResult.data._id; 
      let moderationMessage = "Ad posted successfully!";

      // 2. POST IMAGES & RUN AI MODERATION
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append("images", file); 
        });

        const imageHeaders: HeadersInit = {};
        if (localToken) imageHeaders["Authorization"] = `Bearer ${localToken}`;
        else if (session?.user?.email) imageHeaders["x-google-email"] = session.user.email;

        const imageResponse = await fetch(`http://localhost:5000/api/listings/${newListingId}/images`, {
          method: "POST",
          headers: imageHeaders,
          credentials: "include",
          body: imageFormData,
        });

        const imageResult = await imageResponse.json();

        if (!imageResponse.ok) {
          throw new Error(imageResult.message || "Listing created, but image upload failed.");
        }
        
        // Grab the detailed AI moderation message from the backend!
        if (imageResult.message) {
          moderationMessage = `Ad Created!\n\nAI Moderation Results:\n${imageResult.message}`;
        }
      }

      alert(moderationMessage);
      window.location.href = "/"; 

    } catch (error: any) {
      console.error("Integration Error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryData = CATEGORIES.find((c) => c.id === selectedMainCatId);
  const inputClasses = "w-full p-[14px] border border-[#c9cbcd] rounded text-base box-border focus:outline-none focus:border-[#002f34] focus:border-2 focus:p-[13px]";

  return (
    <ProtectedRoute>
      <div className="max-w-[1100px] mx-auto p-5 font-['Helvetica_Neue',_Arial,_sans-serif] min-h-screen pt-[50px]">
        <h1 className="text-[28px] font-bold text-[#002f34] text-center mt-0 mb-8 capitalize">
          Post Your Ad
        </h1>

        {/* --- STEP 1: MAIN CATEGORY GRID --- */}
        {step === 1 && (
          <>
            <h3 className="text-[22px] font-bold text-[#002f34] mb-4 text-left">Choose a Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleMainCatClick(cat.id)}
                  className="bg-white border border-[#ebebeb] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center h-[160px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:border-[#002f34] hover:-translate-y-1"
                >
                  <div className="text-[40px] mb-4" style={{ color: cat.color ? cat.color : "#002f34" }}>
                    {cat.icon}
                  </div>
                  <div className="text-[16px] font-bold text-[#002f34]">{cat.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- STEP 2: SPLIT VIEW --- */}
        {step === 2 && activeCategoryData && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(1)} className="text-[#007bff] hover:underline font-semibold text-sm">Back</button>
              <span className="text-gray-400">/</span>
              <h3 className="text-[22px] font-bold text-[#002f34]">Choose a Subcategory</h3>
            </div>
            
            <div className="flex border border-[#ebebeb] rounded bg-white min-h-[500px] overflow-hidden shadow-sm">
              <div className="w-[40%] border-r border-[#ebebeb] bg-[#f8f9fa] overflow-y-auto max-h-[600px] custom-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedMainCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSidebarClick(cat.id)}
                      className={`flex items-center px-5 py-[15px] cursor-pointer border-b border-[#eee] transition-all duration-100 border-l-[5px] hover:bg-white hover:text-[#002f34] ${isActive ? "bg-white text-[#002f34] font-bold border-l-[#002f34]" : "bg-transparent text-[#555] font-normal border-l-transparent"}`}
                    >
                      <div className="mr-3 text-[20px] w-6 flex justify-center" style={{ color: cat.color }}>
                        {cat.icon}
                      </div>
                      <span className="flex-grow">{cat.name}</span>
                      {isActive && <FiChevronRight className="text-[#002f34]" />}
                    </div>
                  );
                })}
              </div>

              <div className="w-[60%] bg-white overflow-y-auto max-h-[600px] custom-scrollbar">
                {activeCategoryData.subcategories.map((sub, index) => (
                  <div
                    key={index}
                    onClick={() => handleSubCatClick(sub)}
                    className="px-[25px] py-[18px] border-b border-[#f2f4f5] cursor-pointer text-base text-[#002f34] flex justify-between items-center last:border-b-0 hover:bg-[#e6f7ff] hover:font-semibold hover:text-[#007bff] transition-colors"
                  >
                    <span>{sub}</span>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- STEP 3: DETAILS FORM --- */}
        {step === 3 && (
          <div className="bg-white rounded p-8 border border-[#ced4d6] max-w-[800px] mx-auto shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setStep(2)} className="text-[#007bff] hover:underline font-semibold text-sm">Back to Categories</button>
            </div>

            <div className="mb-6">
              <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Selected Category</label>
              <div className="w-full p-3 border border-[#c9cbcd] rounded text-base font-bold text-black bg-[#f8f8f8]">
                {finalCategory.main} / {finalCategory.sub}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Ad Title</label>
                <input type="text" name="title" placeholder="e.g. Canon EOS DSLR Camera for rent" value={formData.title} onChange={handleChange} required className={inputClasses} />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[15px] text-[#002f34] font-semibold">Upload Images</label>
                  <span className="text-xs text-gray-500 font-medium">({imagePreviews.length}/5 uploaded)</span>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  {imagePreviews.length < 5 && (
                    <label className="w-28 h-28 border-2 border-dashed border-[#c9cbcd] rounded-lg flex flex-col justify-center items-center cursor-pointer text-[#007bff] bg-[#f8f9fa] transition-all hover:border-[#007bff] hover:bg-[#e6f7ff]">
                      <FaCamera size={28} className="mb-2" />
                      <span className="text-xs font-semibold">Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}

                  {imagePreviews.map((img, index) => (
                    <div key={index} className="relative w-28 h-28 rounded-lg group shadow-sm border border-gray-200">
                      <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <button 
                        type="button" 
                        onClick={() => handleImageDelete(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer opacity-0 transition-all group-hover:opacity-100 hover:scale-110 shadow-md"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center rounded-b-lg font-semibold tracking-wider">
                          COVER
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Images must pass AI moderation. Weapons, violence, and inappropriate content will be rejected.</p>
              </div>

              <div>
                <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Price per Day (PKR)</label>
                <input type="number" name="price" placeholder="Amount" value={formData.price} onChange={handleChange} required min="0" className={inputClasses} />
              </div>

              <div>
                <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Description</label>
                <textarea name="description" placeholder="Describe what you are renting out..." value={formData.description} onChange={handleChange} required className={`${inputClasses} min-h-[140px] resize-y`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Location</label>
                  <input type="text" name="location" placeholder="e.g. DHA Phase 6, Lahore" value={formData.location} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                  <label className="block text-[15px] text-[#002f34] mb-2 font-semibold">Contact No</label>
                  <input type="tel" name="contactNumber" placeholder="03XX XXXXXXX" value={formData.contactNumber} onChange={handleChange} required className={inputClasses} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-white text-lg font-bold rounded-lg transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002f34] shadow-md hover:bg-[#004d55] hover:shadow-lg'}`}
              >
                {isSubmitting ? "Processing & Scanning Images..." : "Post Ad"}
              </button>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}