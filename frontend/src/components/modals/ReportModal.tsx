"use client";
import React, { useState, useEffect } from "react"; // Add useEffect
import { createPortal } from "react-dom"; // Add createPortal
import { FiX } from "react-icons/fi";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "ad" | "user"; // This determines what options to show
  id?: number | string; // The ID of the Ad or the User being reported
}

export default function ReportModal({ isOpen, onClose, type, id }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if(isOpen) document.body.style.overflow = 'hidden'; // Optional: Lock scroll
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // --- 1. DIFFERENT OPTIONS BASED ON TYPE ---
  const adReasons = [
    "Offensive content", "Fraud", "Duplicate ad", 
    "Wrong category", "Product unavailable", "Fake product", "Other"
  ];

  const userReasons = [
    "Harassment", "Abusive language", "Scam attempt", "This user is threatening me",
    "Spam", "Inappropriate profile", "Other"
  ];

  const currentReasons = type === "ad" ? adReasons : userReasons;
  const title = type === "ad" ? "Report this Ad" : "Report this User";

  const handleSubmit = () => {
    // In a real app, you would send this data to your backend
    console.log(`Reporting ${type} ID: ${id}`, { reason, comment });
    alert("Report submitted successfully!");
    onClose();
    setReason("");
    setComment("");
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#002f34]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="space-y-3 mb-4">
            {currentReasons.map((r) => (
              <label key={r} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:border-[#002f34] transition-all"
                  />
                  <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#002f34] opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                </div>
                <span className="text-gray-700 text-sm group-hover:text-black">{r}</span>
              </label>
            ))}
          </div>

          <textarea 
            placeholder="Additional comments (optional)" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#002f34] min-h-[80px] resize-none"
          />
        </div>

        {/* Footer */}
        <div className="p-4 pt-0">
          <button 
            onClick={handleSubmit}
            disabled={!reason}
            className={`w-full font-bold py-3 rounded transition ${
                reason ? "bg-[#002f34] text-white hover:bg-[#004247]" : "bg-gray-200 text-gray-400"
            }`}
          >
            Send Report
          </button>
        </div>

      </div>
    </div>,
    document.body // <--- 3. ADD THIS LINE (Attaches modal to the body tag)
  );
}