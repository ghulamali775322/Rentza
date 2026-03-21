"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FaCamera,
  FaMobileAlt,
  FaCar,
  FaKey,
  FaTv,
  FaMotorcycle,
  FaTractor,
  FaCouch,
  FaTshirt,
  FaBookOpen,
  FaHiking,
  FaEllipsisH,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

// --- DATA ---
const CATEGORIES = [
  {
    id: "mobiles",
    name: "Mobiles",
    icon: <FaMobileAlt />,
    color: "#ffce32",
    subcategories: [
      "Mobile Phones",
      "Power Bank",
      "Tablets",
      "Mobile Charger ",
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: <FaCar />,
    color: "#23e5db",
    subcategories: ["Cars", "Motorcycles", "Bicycles", "Spare Parts"],
  },
  {
    id: "property-rent",
    name: "Property for Rent",
    icon: <FaKey />,
    color: "#3d96ff",
    subcategories: ["Houses", "Apartments", "Rooms", "Shop", "Office"],
  },
  {
    id: "electronics",
    name: "Electronics & Home Appliances",
    icon: <FaTv />,
    color: "#ffce32",
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
    id: "bikes",
    name: "Bikes",
    icon: <FaMotorcycle />,
    color: "#23e5db",
    subcategories: [
      "Motorcycles",
      "Scooters",
      "Spare Parts",
      "Bicycles",
      "Bike Acessories",
    ],
  },
  {
    id: "business",
    name: "Business, Industrial & Agriculture",
    icon: <FaTractor />,
    color: "#3d96ff",
    subcategories: [
      "Machinery",
      "Tractors",
      "Medical & Lab Equipment",
      "Agriculture Tools",
    ],
  },
  {
    id: "furniture",
    name: "Furniture & Home Decor",
    icon: <FaCouch />,
    color: "#ff563f",
    subcategories: [
      "Sofa & Chairs",
      "Beds & Wardrobes",
      "Tables",
      "Office Furniture",
      "Decor",
    ],
  },
  {
    id: "fashion",
    name: "Fashion & Beauty",
    icon: <FaTshirt />,
    color: "#23e5db",
    subcategories: [
      "Men",
      "Women",
      "Kids Clothing",
      "Accessories",
      "Watches",
      "Beauty Products",
    ],
  },
  {
    id: "books-sports",
    name: "Books, Sports & Hobbies",
    icon: <FaBookOpen />,
    color: "#ffce32",
    subcategories: [
      "Books",
      "Musical Instruments",
      "Sports Equipment",
      "Gym & Fitness",
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor Equipment",
    icon: <FaHiking />,
    color: "#ff563f",
    subcategories: ["Camping", "Hiking", "Fishing", "Skiing"],
  },
  {
    id: "other",
    name: "Other",
    icon: <FaEllipsisH />,
    color: "#3d96ff",
    subcategories: ["Miscellaneous", "Events"],
  },
];
// Helper function to read cookies (for Google Auth)
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export default function CreateListingPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMainCatId, setSelectedMainCatId] = useState<string>("");
  const [finalCategory, setFinalCategory] = useState({ main: "", sub: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]); // The raw files for the backend
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // The URLs for the screen
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable the button while loading
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    contactNumber: "",
    location: "",
  });

  // --- HANDLERS ---
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
    const mainCatName =
      CATEGORIES.find((c) => c.id === selectedMainCatId)?.name || "";
    setFinalCategory({ main: mainCatName, sub: sub });
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews: string[] = [];
      const filesToKeep: File[] = [];
      
      // Enforce the backend's 5 image limit
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
      // 1. Check for Email Login (LocalStorage)
      const localToken = localStorage.getItem("token"); 
      
      // 2. THE FIX: Check for Google Login (Session)
      if (!localToken && !session) {
        throw new Error("You must be logged in to post an ad.");
      }

      // --- SILENT GEOCODING (Converts text to coordinates for your backend) ---
      let coordinates = [74.3587, 31.5204]; // Default fallback coordinates (Lahore)
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
        }
      } catch (geoError) {
        console.warn("Could not geocode location, using default.", geoError);
      }

      // Format data perfectly for your backend schema
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

      // Set up headers (Send localToken if email user)
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (localToken) {
        headers["Authorization"] = `Bearer ${localToken}`;
      }

      // Send Text Data
      const textResponse = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: headers,
        credentials: "include", // Crucial: This forces the browser to send the invisible Google cookie to the backend!
        body: JSON.stringify(listingData),
      });

      const textResult = await textResponse.json();

      if (!textResponse.ok) {
        throw new Error(textResult.message || "Failed to save listing details.");
      }

      const newListingId = textResult.data._id; 

      // Send Images (If any exist)
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append("images", file); 
        });

        const imageHeaders: HeadersInit = {};
        if (localToken) {
          imageHeaders["Authorization"] = `Bearer ${localToken}`;
        }

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
      }

      alert("Ad posted successfully!");
      window.location.href = "/"; 

    } catch (error: any) {
      console.error("Integration Error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategoryData = CATEGORIES.find((c) => c.id === selectedMainCatId);

  // Reusable styles for inputs to handle the specific focus behavior (border width change + padding adjustment)
  const inputClasses =
    "w-full p-[14px] border border-[#c9cbcd] rounded text-base box-border focus:outline-none focus:border-[#002f34] focus:border-2 focus:p-[13px]";

  return (
    <ProtectedRoute>
      {/* Container */}
      <div className="max-w-[1100px] mx-auto p-5 font-['Helvetica_Neue',_Arial,_sans-serif]">
        {/* PageTitle */}
        <h1 className="text-[28px] font-bold text-[#002f34] text-center mt-0 mb-2.5 capitalize">
          Post Your Ad
        </h1>

        {/* --- STEP 1: MAIN CATEGORY GRID --- */}
        {step === 1 && (
          <>
            {/* StepTitle */}
            <h3 className="text-[22px] font-bold text-[#002f34] mb-2.5 text-left">
              Choose a Category
            </h3>

            {/* CategoryGrid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[25px]">
              {CATEGORIES.map((cat) => (
                // CategoryCard
                <div
                  key={cat.id}
                  onClick={() => handleMainCatClick(cat.id)}
                  className="bg-white border border-[#ebebeb] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center h-[180px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:border-[#002f34] hover:-translate-y-1"
                >
                  <div
                    className="text-[50px] mb-5"
                    style={{ color: cat.color ? cat.color : "#002f34" }}
                  >
                    {cat.icon}
                  </div>
                  <div className="text-[18px] font-bold text-[#002f34]">
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- STEP 2: SPLIT VIEW --- */}
        {step === 2 && activeCategoryData && (
          <>
            <h3 className="text-[22px] font-bold text-[#002f34] mb-2.5 text-left">
              Choose a category
            </h3>

            {/* SplitContainer */}
            <div className="flex border border-[#ebebeb] rounded bg-white min-h-[500px] overflow-hidden">
              {/* LEFT SIDEBAR (LeftSidebar) */}
              <div className="w-[40%] border-r border-[#ebebeb] bg-[#f8f9fa] overflow-y-auto max-h-[400px] [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-thumb]:rounded-[5px]">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedMainCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSidebarClick(cat.id)}
                      className={`
                        flex items-center px-5 py-[15px] cursor-pointer border-b border-[#eee] transition-all duration-100 border-l-[5px] hover:bg-white hover:text-[#002f34]
                        ${
                          isActive
                            ? "bg-white text-[#002f34] font-bold border-l-[#002f34]"
                            : "bg-transparent text-[#555] font-normal border-l-transparent"
                        }
                      `}
                    >
                      <div className="mr-2.5 text-[20px] w-6 flex justify-center">
                        {cat.icon}
                      </div>
                      {cat.name}
                      {isActive && (
                        <IoIosArrowForward className="ml-auto text-[#002f34]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* RIGHT PANEL (RightPanel) */}
              <div className="w-[65%] bg-white overflow-y-auto max-h-[600px] [&::-webkit-scrollbar]:w-[15px] [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-thumb]:rounded-[3px]">
                {activeCategoryData.subcategories.map((sub, index) => (
                  // SubCategoryItem
                  <div
                    key={index}
                    onClick={() => handleSubCatClick(sub)}
                    className="px-[25px] py-[18px] border-b border-[#f2f4f5] cursor-pointer text-base text-[#002f34] flex justify-between items-center last:border-b-0 hover:bg-[#ebeeef] hover:font-semibold hover:text-[#007bff]"
                  >
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- STEP 3: DETAILS FORM --- */}
        {step === 3 && (
          // FormContainer
          <div className="bg-white rounded p-10 border border-[#ced4d6] max-w-[800px] mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
            {/* LOCKED CATEGORY DISPLAY */}
            <div className="mb-[30px] pb-[15px]">
              <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold mt-[15px]">
                Category
              </label>
              {/* FinalCategoryDisplay */}
              <div className="w-full p-[14px_15px] border border-[#c9cbcd] rounded text-base font-bold text-black bg-[#f8f8f8] mb-[5px] box-border">
                {finalCategory.sub}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* FormSection */}
              <div className="mb-[15px] pb-[15px]">
                <div className="mb-[25px]">
                  <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold">
                    Ad Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Canon EOS DSLR Camera for rent"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                {/* FormSection nested */}
                <div className="mb-[15px] pb-[15px]">
                  <h3 className="text-[20px] font-bold text-[#002f34] mb-5">
                    Upload Images
                  </h3>

                  {/* ImageUploadContainer */}
                  <div className="flex gap-[15px] flex-wrap">
                    {/* Upload Picker Button */}
                    {imagePreviews.length < 5 && (
                      <label className="w-[110px] h-[110px] border border-dashed border-[#c9cbcd] rounded flex flex-col justify-center items-center cursor-pointer text-[#007bff] bg-[#e6f7ff] transition-all duration-200 relative hover:border-[#007bff] hover:bg-[#d6efff]">
                        <FaCamera size={30} />
                        <span className="mt-2 text-sm">
                          ({imagePreviews.length}/5)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple={true}
                          onChange={handleImageUpload}
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                    )}

                    {/* PREVIEWS */}
                    {imagePreviews.map((img, index) => (
                      // ImageWrapper
                      <div
                        key={index}
                        className="relative inline-block cursor-pointer w-[110px] h-[110px] rounded group"
                      >
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-[110px] h-[110px] object-cover rounded border border-[#ddd]"
                        />

                        {/* DeleteButton */}
                        <button
                          type="button"
                          onClick={() => handleImageDelete(index)}
                          className="absolute -top-2 -right-2 bg-white text-black border border-[#ccc] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold cursor-pointer z-10 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110 hover:bg-[#eee]"
                        >
                          &times;
                        </button>

                        {/* Cover Label */}
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-[5px] py-[2px] rounded-tr font-bold tracking-[0.5px]">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-[15px] pb-[15px]">
                <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold">
                  Price per Day (PKR)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Amount"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className={inputClasses}
                />
              </div>

              {/* Description Section */}
              <div className="mb-[15px] pb-[15px]">
                <div>
                  <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe what you are renting out..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full p-[14px] border border-[#c9cbcd] rounded text-base box-border min-h-[140px] resize-none focus:outline-none focus:border-[#002f34] focus:border-2 focus:p-[13px]"
                  />
                </div>
              </div>

             {/* Location Section */}
              <div className="mb-[15px] pb-[15px]">
                <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. DHA Phase 6, Lahore"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              {/* Contact Section */}
              <div className="mb-[15px] pb-[15px]">
                <label className="block text-[15px] text-[#002f34] mb-2.5 font-semibold">
                  Contact No
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="+92 300 1234567"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              {/* SubmitButton */}
              <button
               type="submit"
                  disabled={isSubmitting}
                   className={`w-full p-[18px] text-white text-[18px] font-bold border-none rounded transition-all duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#002f34] cursor-pointer hover:bg-[#005861]'}`}
>
                    {isSubmitting ? "Posting Ad..." : "Submit Listing"}
            </button>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
