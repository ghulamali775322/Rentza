"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState } from "react";
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

export default function CreateListingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMainCatId, setSelectedMainCatId] = useState<string>("");
  const [finalCategory, setFinalCategory] = useState({ main: "", sub: "" });
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    contactNumber: "",
  });

  // --- HANDLERS ---
  const handleImageDelete = (indexToDelete: number) => {
    setImages((currentImages) =>
      currentImages.filter((_, index) => index !== indexToDelete),
    );
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
      const newImageUrls: string[] = [];
      const remainingSlots = 10 - images.length;

      for (let i = 0; i < newFiles.length; i++) {
        if (i >= remainingSlots) break;
        const file = newFiles[i];
        const imageUrl = URL.createObjectURL(file);
        newImageUrls.push(imageUrl);
      }
      setImages((prevImages) => [...prevImages, ...newImageUrls]);
    }
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Listing Created:", { ...finalCategory, ...formData, images });
    alert("Ad posted successfully!");
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
                    {images.length < 10 && (
                      <label className="w-[110px] h-[110px] border border-dashed border-[#c9cbcd] rounded flex flex-col justify-center items-center cursor-pointer text-[#007bff] bg-[#e6f7ff] transition-all duration-200 relative hover:border-[#007bff] hover:bg-[#d6efff]">
                        <FaCamera size={30} />
                        <span className="mt-2 text-sm">
                          ({images.length}/10)
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
                    {images.map((img, index) => (
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
                className="w-full p-[18px] bg-[#002f34] text-white text-[18px] font-bold border-none rounded cursor-pointer hover:bg-[#005861]"
              >
                Submit Listing
              </button>
            </form>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
