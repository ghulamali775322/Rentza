"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import { FiSave } from "react-icons/fi";
import { getListingDetails, updateListing } from "@/app/api/admin/listings";

// --- MOCK DATABASE ---

export default function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listingId = params.id;
  const router = useRouter();

  // STATE FOR EDITING
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  type ListingImage = {
    id: number; // frontend index
    _id: string; // backend MongoDB _id
    url: string; // image URL
  };

  const [images, setImages] = useState<ListingImage[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]); // backend _id's
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("active"); // temporary default
  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await getListingDetails(listingId);

        if (res?.data?.success && res.data.data) {
          const data = res.data.data;

          // ✅ SET ALL STATES FROM API
          setTitle(data.title || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setPrice(data.price?.toString() || "");
          setContactNumber(data.contactNumber || "");
          setAddress(data.address || "");
          setStatus(data.status || "active");

          // ✅ IMAGES
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

          const imgs: ListingImage[] =
            data.images?.map((img: any, idx: number) => ({
              id: idx, // frontend index
              _id: img._id, // backend ID
              url: `${API_URL}${img.url}`,
            })) || [];

          setImages(imgs);
          setSelectedImage(imgs[0]?.url || "");
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleRemoveImage = (id: number) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);

      if (removed) {
        // push backend _id to removedImages
        setRemovedImages((prevRemoved) => [...prevRemoved, removed._id]);
      }

      const updated = prev.filter((img) => img.id !== id);

      if (selectedImage === removed?.url) {
        setSelectedImage(updated[0]?.url || "");
      }

      return updated;
    });
  };
  // Submit the form
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      category,
      description,
      price: Number(price),
      contactNumber,
      address,
      status,
      removedImages,
    };

    try {
      const res = await updateListing(listingId, payload);

      if (res?.data?.success) {
        alert("Listing updated successfully!");
        router.push(`/admin/listings/${listingId}`);
      } else {
        throw new Error(res?.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update listing.");
    }
  };
  const inputStyles =
    "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent text-[#002f34] bg-gray-50 hover:bg-white transition-colors";

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500 text-lg">
        Loading listing...
      </div>
    );
  }
  return (
    <form onSubmit={handleSaveChanges} className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/listings/${listingId}`}
          className="p-2 text-black rounded-full hover:bg-gray-100 transition"
        >
          <IoMdArrowBack size={24} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-[#002f34]">Edit Listing</h1>
          <p className="text-sm text-gray-500">Listing ID: {listingId}</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="text-black grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* BASIC INFO CARD */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#002f34] mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 uppercase">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0077ff] focus:bg-white transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-gray-400 uppercase">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0077ff] focus:bg-white transition"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs text-gray-400 uppercase">
                  Price (per day)
                </label>
                <div className="flex items-center mt-1 border border-gray-200 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-[#0077ff]">
                  <span className="px-3 text-gray-500 text-sm">Rs.</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-2 py-3 bg-transparent focus:outline-none"
                  />
                  <span className="px-3 text-gray-400 text-sm">/day</span>
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-xs text-gray-400 uppercase">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0077ff] focus:bg-white transition"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-gray-400 uppercase">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0077ff] focus:bg-white transition"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 uppercase">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0077ff] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* IMAGES CARD */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#002f34]">Listing Images</h2>

            {/* MAIN IMAGE */}
            <div className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <span className="text-gray-400">No Image Selected</span>
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 flex-wrap">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  {/* IMAGE */}
                  <img
                    src={img.url}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-24 h-24 object-cover rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImage === img.url
                        ? "border-[#0077ff] shadow-md"
                        : "border-gray-200"
                    }`}
                  />

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (ADMIN PANEL) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#002f34]">Admin Info</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400">Listing ID</p>
                <p className="font-medium text-[#002f34]">{listingId}</p>
              </div>

              <div>
                <p className="text-gray-400">Status</p>
                <span
                  className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    status === "active"
                      ? "bg-green-100 text-green-600"
                      : status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-4 border-t">
              <Link
                href={`/admin/listings/${listingId}`}
                className="block w-full text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0077ff] text-white font-semibold hover:bg-[#005fcc]"
              >
                <FiSave size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
