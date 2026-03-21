"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import { FiSave } from "react-icons/fi";

// --- MOCK DATABASE ---
const MOCK_LISTING = {
  id: "L001",
  title: "Professional DSLR Camera",
  category: "Electronics",
  price: "500/day",
  description: "High-quality Canon EOS R5 camera for professional photography. Includes 24-70mm lens and accessories."
};

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
  const router = useRouter();

  // STATE FOR EDITING
  const [title, setTitle] = useState(MOCK_LISTING.title);
  const [category, setCategory] = useState(MOCK_LISTING.category);
  const [description, setDescription] = useState(MOCK_LISTING.description);
  const [price, setPrice] = useState(MOCK_LISTING.price);

  // Submit the form
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send a PUT/PATCH request to your backend
    alert("Listing successfully updated!");
    router.push(`/admin/listings/${listingId}`);
  };

  const inputStyles = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent text-[#002f34] bg-gray-50 hover:bg-white transition-colors";

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/admin/listings/${listingId}`}
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-[#002f34] transition-colors"
        >
          <IoMdArrowBack size={28} />
        </Link>
        <h1 className="text-3xl font-bold text-[#002f34]">Edit Listing</h1>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-8">
        
        {/* MAIN EDIT FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-[#002f34] mb-6 border-b border-gray-100 pb-4">Listing Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 mb-2">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className={inputStyles} 
                required 
              />
            </div>

            {/* Category (Changed to Text Input) */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className={inputStyles} 
                required 
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Price</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className={inputStyles} 
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
              <textarea 
                rows={5} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className={inputStyles}
                required
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-4">
          <Link 
            href={`/admin/listings/${listingId}`}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#007bff] text-white font-bold hover:bg-[#0056b3] transition-colors shadow-sm"
          >
            <FiSave size={20} /> Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}