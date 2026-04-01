"use client";
import React, { useState, useEffect } from "react"; 
import { createPortal } from "react-dom"; 
import { FiX } from "react-icons/fi";
import { useSession } from "next-auth/react"; // NEEDED FOR AUTH CHECK

// 1. IMPORT TOAST
import toast from "react-hot-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "ad" | "user"; 
  id?: number | string; 
}

export default function ReportModal({ isOpen, onClose, type, id }: ReportModalProps) {
  const { data: session } = useSession(); // Grab session data
  
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent spam clicking
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if(isOpen) document.body.style.overflow = 'hidden'; 
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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

  // --- THE FIX: REAL BACKEND INTEGRATION ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Securely fetch the Reporter's MongoDB ID
      let reporterId = (session?.user as any)?.id || (session?.user as any)?._id;
      const localToken = localStorage.getItem("token");
      
      if (!reporterId && localToken) {
        try {
          const payload = JSON.parse(atob(localToken.split(".")[1]));
          reporterId = payload._id || payload.id || payload.userId;
        } catch (e) {}
      }

      if (!reporterId && (localToken || session?.user?.email)) {
        try {
          const headers: HeadersInit = {};
          if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
          else if (session?.user?.email) headers["x-google-email"] = session.user.email;
          const profileRes = await fetch("http://localhost:5000/profile", { headers });
          const profileData = await profileRes.json();
          reporterId = profileData?.user?._id;
        } catch (e) {}
      }

      // If they somehow bypassed the UI to click report without being logged in
      if (!reporterId) {
        toast.error("You must be logged in to submit a report."); // REPLACED ALERT
        setIsSubmitting(false);
        return;
      }

      // 2. Package the exact payload your backend expects
      const payload = {
        reporterId: reporterId,
        reportedListingId: id,
        reason: reason,
        additionalComments: comment
      };

      // 3. Send it to the database
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Report submitted successfully!"); // REPLACED ALERT
        onClose();
        setReason("");
        setComment("");
      } else {
        toast.error(result.message || "Failed to submit report."); // REPLACED ALERT
      }

    } catch (error) {
      console.error("Report submission error:", error);
      toast.error("An error occurred while submitting the report."); // REPLACED ALERT
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    // 3. FIXED Z-INDEX SO TOASTS APPEAR ON TOP
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
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
            disabled={!reason || isSubmitting}
            className={`w-full font-bold py-3 rounded transition ${
                reason && !isSubmitting ? "bg-[#002f34] text-white hover:bg-[#004247]" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Report"}
          </button>
        </div>

      </div>
    </div>,
    document.body 
  );
}