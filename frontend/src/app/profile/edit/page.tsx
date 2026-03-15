"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FiInfo } from 'react-icons/fi';

// --- HELPER DATA ---
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const youngestAllowedYear = currentYear; 
  const oldestAllowedYear = 1950; 
  const years = [];
  for (let y = youngestAllowedYear; y >= oldestAllowedYear; y--) {
    years.push(y.toString());
  }
  return years;
};

export default function EditProfilePage() {
  const [profileData, setProfileData] = useState({
    name: '',
    dobDay: '',    
    dobMonth: '', 
    dobYear: '',   
    gender: '',    
    phone: '', 
    email: '',
  });

  // --- ADD PHOTO STATE AND HANDLERS ---
  const [profileImageUrl, setProfileImageUrl] = useState(''); // Tracks the uploaded image URL

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Creates a temporary URL for the browser to display the image
          setProfileImageUrl(URL.createObjectURL(file)); 
      }
  };

  const handleRemovePhoto = () => {
      // Clears the image URL, which hides the remove button and the image
      setProfileImageUrl(''); 
  };

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = generateYears();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile Data Saved:", profileData);
    alert('Changes saved successfully!');
  };

  // --- REUSABLE TAILWIND CLASSES ---
  const labelClass = "block text-sm text-[#444] mb-2 font-bold";
  const inputClass = "max-w-[500px] w-full p-3 border border-[#ddd] rounded text-base box-border mb-[25px] bg-white focus:outline-none focus:border-[#007bff]";
  const selectClass = "flex-1 p-3 border border-[#ddd] rounded text-base bg-white cursor-pointer focus:outline-none focus:border-[#002f34]";

  return (
    // EditContainer
    <div className="max-w-[600px] mx-auto py-10 px-5 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] min-h-auto pt-[30px] mb-[50px]">
      
      {/* FormTitle */}
      <h1 className="text-[28px] font-bold text-[#002f34] mb-0 pb-[25px]">Edit profile</h1>
      
      {/* TopDivider */}
      <div className="w-full border-t border-[#eee] mb-0" />
      
      {/* --- PROFILE PHOTO SECTION --- */}
      {/* Inline style from original code converted to class or inline style preserved where specific */}
      <label className="block text-[18px] text-[#002f34] font-bold mt-[15px] mb-2">Profile Photo</label>
      
      {/* PhotoSection */}
      <div className="flex items-center gap-5 mb-5 pb-2.5">
        {/* AvatarCircle */}
        <div className="relative w-[90px] h-[90px] rounded-full bg-[#007bff] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
            {profileImageUrl ? (
                <img 
                    src={profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                "U" // Default 'U' initial if no image
            )}
        </div>
        
        <div className="flex flex-col gap-[5px] mt-[30px]">
            <div className="flex items-center">
                
                {/* UploadButton (as label) */}
                <label className="bg-[#002f34] text-white border-none rounded-md py-2.5 px-5 text-sm font-semibold cursor-pointer transition-colors hover:bg-[#005861]">
                    Upload Photo
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleUploadPhoto}
                    />
                </label>
                
                {/* RemoveButton */}
                {profileImageUrl && (
                    <button 
                      onClick={handleRemovePhoto}
                      className="bg-transparent text-[#002f34] border border-[#002f34] rounded-md py-2.5 px-5 text-sm font-semibold cursor-pointer ml-2.5 transition-colors hover:bg-[#002f34] hover:text-white"
                    >
                        Remove
                    </button> 
                )}
            </div>
            
            {/* InfoText */}
            <p className="text-xs text-black mt-[5px] flex items-center gap-[5px]">
              <FiInfo size={14} className="min-w-[14px]" /> 
              JPG, JPEG, PNG Min: 400px. Max: 1024px
            </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* --- NAME --- */}
        <label className={`${labelClass} mt-[15px]`}>Name</label>
        <input 
          type="text" 
          name="name" 
          value={profileData.name} 
          onChange={handleChange}
          placeholder="Enter your full name"
          className={inputClass}
        /> 
        
        {/* --- DATE OF BIRTH & GENDER --- */}
        <label className={labelClass}>Date of Birth</label>
        {/* SelectGroup */}
        <div className="flex gap-[15px] mb-[15px] max-w-[500px] w-full">
          <select name="dobDay" value={profileData.dobDay} onChange={handleChange} className={selectClass}>
            <option value="" disabled>DD</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select name="dobMonth" value={profileData.dobMonth} onChange={handleChange} className={selectClass}>
            <option value="" disabled>MM</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          
          <select name="dobYear" value={profileData.dobYear} onChange={handleChange} className={selectClass}>
            <option value="" disabled>YYYY</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <label className={`${labelClass} mt-[15px]`}>Gender</label> 
        <select 
          name="gender" 
          value={profileData.gender} 
          onChange={handleChange} 
          className={`${selectClass} w-full max-w-[500px] mb-10`} // Added w-full to match Input width behavior here and mb-10 for the margin
        >
          <option value="" disabled>Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        
        {/* --- CONTACT INFORMATION SECTION --- */}
        <label className={labelClass}>Email</label>
        <input 
          type="email" 
          name="email" 
          value={profileData.email}
          onChange={handleChange}
          placeholder="Enter your new email address" 
          className={inputClass}
        />
        
        <label className={labelClass}>Mobile Number</label>
        <input 
          type="tel" 
          name="phone" 
          value={profileData.phone}
          onChange={handleChange}
          placeholder="+92 3XX XXX XXXX"
          className={inputClass}
        />
        
        <div className="flex justify-between items-center mt-[30px]">
          {/* Discard Link */}
          <Link 
            href="/" 
            className="text-lg font-semibold text-[#002f34] underline py-3 transition-colors hover:text-[#e00]"
          >
              Discard
          </Link>
          
          {/* Save Button */}
          <button 
            type="submit"
            className="w-[180px] py-3 bg-[#002f34] text-white text-base font-bold border-none rounded cursor-pointer mt-5 transition-colors hover:bg-[#004d55]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}