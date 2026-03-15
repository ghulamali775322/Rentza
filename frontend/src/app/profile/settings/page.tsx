"use client";

import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'; // For password toggle
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi'; // Icons for alert/delete confirmation

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password strength validation logic
  const meetsMinLength = newPassword.length >= 8;
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);

  const isNewPasswordValid = meetsMinLength && hasNumber && hasSpecialChar && hasLetter;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword) {
      setNewPasswordError('New password is required.');
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required.');
      return;
    }
    if (!isNewPasswordValid) {
        setNewPasswordError('Password does not meet all requirements.');
        return;
    }
    if (!passwordsMatch) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
    
    // If all checks pass
    console.log("Password changed!");
    alert("Password updated successfully!");
    setNewPassword(''); // Clear fields on success
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to permanently delete your Rentza account? This action cannot be undone.")) {
      console.log("Account deletion requested.");
      alert("Account deletion process initiated. You will be logged out shortly.");
      // In a real app, you would dispatch an API call and then redirect/logout
    }
  };

  // --- REUSABLE TAILWIND CLASSES ---
  const contentBoxClass = "bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-[30px] p-[30px]";
  const sectionTitleClass = "text-2xl font-bold text-[#002f34] mb-[25px]";
 const inputBaseClass = "w-full py-3 px-[15px] border rounded text-base box-border mb-2.5 bg-white focus:outline-none focus:border-[#007bff] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden";
  const passwordToggleBtnClass = "absolute top-1/2 right-3 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] text-xl hover:text-[#007bff]";
  const errorMessageClass = "text-xs text-[#e30000] -mt-2 mb-[15px] flex items-center gap-[5px]";
  const passwordReqClass = "text-xs mb-[5px] flex items-center gap-[5px]";

  return (
    // SettingsContainer: max-w-900, margin auto, padding 40px 20px, bg light grey, min-h calc, pt-40, pb-50
    <div className="max-w-[900px] mx-auto px-5 py-10 pt-10 pb-[50px] bg-[#f5f5f5] min-h-[calc(100vh-80px)]">
      
      {/* 1. CHANGE PASSWORD SECTION */}
      <div className={contentBoxClass}>
        <h2 className={sectionTitleClass}>Create password</h2> 
        <form onSubmit={handlePasswordChange}>
          
          {/* New Password Input */}
          <div className="relative w-full mb-5">
            <input 
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError(''); 
              }}
              placeholder="New password"
              className={`${inputBaseClass} ${newPasswordError ? 'border-[#e30000]' : 'border-[#ddd]'}`}
            />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={passwordToggleBtnClass}>
              {showNewPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
          {newPasswordError && <p className={errorMessageClass}><FiAlertCircle size={14} /> {newPasswordError}</p>}

          {/* Password Requirements */}
          {!newPasswordError && newPassword.length > 0 && (
            <div className="mb-5">
              <p className={`${passwordReqClass} ${meetsMinLength ? 'text-[#008000] font-semibold' : 'text-[#888]'}`}>
                {meetsMinLength ? '✔' : '✖'} Minimum 8 characters
              </p>
              <p className={`${passwordReqClass} ${hasNumber ? 'text-[#008000] font-semibold' : 'text-[#888]'}`}>
                {hasNumber ? '✔' : '✖'} At least 1 number
              </p>
              <p className={`${passwordReqClass} ${hasSpecialChar ? 'text-[#008000] font-semibold' : 'text-[#888]'}`}>
                {hasSpecialChar ? '✔' : '✖'} At least 1 special character
              </p>
              <p className={`${passwordReqClass} ${hasLetter ? 'text-[#008000] font-semibold' : 'text-[#888]'}`}>
                {hasLetter ? '✔' : '✖'} At least 1 letter
              </p>
            </div>
          )}

          {/* Confirm Password Input */}
          <div className="relative w-full mb-5">
            <input 
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(''); 
              }}
              placeholder="Confirm new password"
              className={`${inputBaseClass} ${confirmPasswordError ? 'border-[#e30000]' : 'border-[#ddd]'}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={passwordToggleBtnClass}>
              {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
          {confirmPasswordError && <p className={errorMessageClass}><FiAlertCircle size={14} /> {confirmPasswordError}</p>}
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={!isNewPasswordValid || !passwordsMatch}
            className="w-[180px] py-2.5 px-5 bg-[#002f34] text-white text-base font-bold border-none rounded cursor-pointer mt-5 transition-colors duration-200 hover:bg-[#004d55] disabled:bg-[#ccc] disabled:cursor-not-allowed"
          >
            Create password
          </button>
        </form>
      </div>
      
      {/* 2. DELETE ACCOUNT SECTION */}
      <div className={contentBoxClass}>
        <h2 className={sectionTitleClass}>Delete this account</h2>
        
        <p className="text-[15px] text-[#333] mb-5 leading-[1.5]">
          Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including ads and profile information, will be removed.
        </p>
        
        <button 
          type="button" 
          onClick={handleDeleteAccount}
          className="py-3 px-[25px] bg-[#d32f2f] text-white border-none rounded text-base font-bold cursor-pointer transition-colors duration-200 flex items-center gap-2.5 hover:bg-[#c62828]"
        >
           <FiTrash2 size={18} />
           Yes, delete my account
        </button>
      </div>
      
    </div>
  );
}