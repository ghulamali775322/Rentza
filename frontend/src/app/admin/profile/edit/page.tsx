"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiInfo } from 'react-icons/fi';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: '',
    email: '',
    mobileNumber: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    setProfileImage(null);
  };

  // Helper arrays for Date of Birth
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving Profile:", formData);
    alert("Profile Updated Successfully!");
  };

  const inputClasses = "w-full p-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-[#007bff]  focus:ring-[#007bff] transition-all";

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 my-0">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Profile Photo Section */}
        <div>
          <label className="block text-xl font-bold text-[#002f34] mb-4">Profile Photo</label>
          <div className="flex items-center gap-6">

            {/* Avatar Circle */}
            <div className="relative w-20 h-20 rounded-full bg-[#007bff] flex items-center justify-center overflow-hidden shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">U</span>
              )}
            </div>

            {/* Upload and Remove Buttons */}
            <div>
              {/* Upload Button */}
              <label className="inline-block bg-[#002f34] text-white px-4 py-2 rounded-md text-sm font-bold cursor-pointer hover:bg-[#004d55] transition-colors">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {/* Remove Button — only appears when photo exists */}
              {profileImage && (
                <button
                  onClick={handleRemovePhoto}
                  type="button"
                  className="ml-3 inline-block border border-[#002f34] text-[#002f34] px-4 py-2 rounded-md text-sm font-bold cursor-pointer hover:bg-[#002f34] hover:text-white transition-colors"
                >
                  Remove
                </button>
              )}

              {/* Info Text */}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                <FiInfo size={14} />
                <span>JPG, JPEG, PNG Min: 400px, Max: 1024px</span>
              </div>
            </div>

          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-[#002f34] mb-2">Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={inputClasses}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-bold text-[#002f34] mb-2">Date of Birth</label>
          <div className="flex gap-4">

            <select
              name="dobDay"
              value={formData.dobDay}
              onChange={handleChange}
              className={`${inputClasses} bg-white cursor-pointer`}
            >
              <option value="" disabled>DD</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              name="dobMonth"
              value={formData.dobMonth}
              onChange={handleChange}
              className={`${inputClasses} bg-white cursor-pointer`}
            >
              <option value="" disabled>MM</option>
              {months.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
            </select>

            <select
              name="dobYear"
              value={formData.dobYear}
              onChange={handleChange}
              className={`${inputClasses} bg-white cursor-pointer`}
            >
              <option value="" disabled>YYYY</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-bold text-[#002f34] mb-2">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`${inputClasses} bg-white cursor-pointer`}
          >
            <option value="" disabled>Select your gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-[#002f34] mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your new email address"
            className={inputClasses}
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-bold text-[#002f34] mb-2">Mobile Number</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="+92 3XX XXX XXXX"
            className={inputClasses}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <Link href="/admin" className="text-[#002f34] font-bold underline hover:text-red-600 transition-colors">
            Discard
          </Link>

          <button
            type="submit"
            className="bg-[#002f34] text-white px-8 py-3 rounded-md font-bold hover:bg-[#004d55] transition-all shadow-sm active:scale-95"
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
