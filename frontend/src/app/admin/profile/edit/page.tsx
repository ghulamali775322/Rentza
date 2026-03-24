"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiInfo } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProfilePage() {
  const { data: session } = useSession();
  const { setName, setProfilePhotoUrl } = useUser();

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers: HeadersInit = {};

        if (session?.user?.email) {
          headers["x-google-email"] = session.user.email;
        } else {
          const token = localStorage.getItem("token");
          if (token) headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/user/profile`, { headers });
        const data = await res.json();

        setProfileData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
        });

        setProfileImageUrl(
          data.profilePhotoPath ? `${API_URL}${data.profilePhotoPath}` : "",
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // ✅ INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ IMAGE UPLOAD
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfileImageUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setProfileImageUrl("");
    setRemovePhoto(true);
  };

  // ✅ SAVE PROFILE
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = { name: "", phone: "" };

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!/^\d{11}$/.test(profileData.phone)) {
      newErrors.phone = "Phone must be 11 digits";
    }

    if (newErrors.name || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    setErrors({ name: "", phone: "" });
    setSaving(true);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("phone", profileData.phone);
      formData.append("removePhoto", removePhoto.toString());

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("profilePhoto", fileInput.files[0]);
      }

      const headers: HeadersInit = {};

      if (session?.user?.email) {
        headers["x-google-email"] = session.user.email;
      } else {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers,
        body: formData,
      });

      const updated = await res.json();

      setName(updated.user.name);
      const photoUrl = updated.user.profilePhotoPath
        ? `${API_URL}${updated.user.profilePhotoPath}?t=${Date.now()}`
        : "";

      setProfilePhotoUrl(photoUrl);
      setProfileImageUrl(photoUrl);

      setSuccessMessage("Profile updated successfully!");
      setRemovePhoto(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="max-w-[600px] text-black mx-auto py-10 px-5 bg-white rounded-lg shadow min-h-auto pt-[30px] mb-[50px]">
        {/* ✅ SUCCESS MESSAGE */}
        {successMessage && (
          <div className="text-green-600 font-semibold mb-3">
            {successMessage}
          </div>
        )}

        <div className="w-full border-t border-[#eee] mb-0" />

        {/* Profile Photo */}
        <label className="block text-[18px] text-[#002f34] font-bold mt-[15px] mb-2">
          Profile Photo
        </label>

        <div className="flex items-center gap-5 mb-5 pb-2.5">
          <div className="relative w-[90px] h-[90px] rounded-full bg-[#007bff] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "U"
            )}
          </div>

          <div className="flex flex-col gap-[5px] mt-[30px]">
            <div className="flex items-center">
              <label className="bg-[#002f34] text-white rounded-md py-2.5 px-5 text-sm font-semibold cursor-pointer hover:bg-[#005861]">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadPhoto}
                />
              </label>

              {profileImageUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="bg-transparent text-[#002f34] border border-[#002f34] rounded-md py-2.5 px-5 text-sm font-semibold ml-2.5 hover:bg-[#002f34] hover:text-white"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-black mt-[5px] flex items-center gap-[5px]">
              <FiInfo size={14} /> JPG, JPEG, PNG Min: 400px. Max: 1024px
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-[#444] mb-2 font-bold mt-[15px]">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="max-w-[500px] w-full p-3 border border-[#ddd] rounded text-base mb-1"
          />

          {errors.name && (
            <p className="text-red-500 text-sm mb-3">{errors.name}</p>
          )}

          <label className="block text-sm text-[#444] mb-2 font-bold">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={profileData.email}
            disabled
            className="max-w-[500px] w-full p-3 border border-[#ddd] rounded mb-[25px] bg-[#f3f3f3]"
          />

          <label className="block text-sm text-[#444] mb-2 font-bold">
            Mobile Number
          </label>

          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            placeholder="+92 3XX XXX XXXX"
            className="max-w-[500px] w-full p-3 border border-[#ddd] rounded mb-1"
          />

          {errors.phone && (
            <p className="text-red-500 text-sm mb-3">{errors.phone}</p>
          )}

          <div className="flex justify-between items-center mt-[30px]">
            <Link
              href="/admin"
              className="text-lg font-semibold text-[#002f34] underline py-3 hover:text-[#e00]"
            >
              Discard
            </Link>

            <button
              type="submit"
              disabled={saving}
              className={`w-[180px] py-3 text-white font-bold rounded ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#002f34] hover:bg-[#004d55]"
              }`}
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
