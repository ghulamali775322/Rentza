"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlertCircle, FiX } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; 
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent background scrolling when open & handle hydration
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Don't render anything if the modal is closed or not mounted yet
  if (!isOpen || !mounted) return null;

 return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
        >
          <FiX size={22} />
        </button>

        {/* Centered Header & Icon */}
        <div className="flex flex-col items-center pt-8 px-6 pb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm ${
            isDestructive ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#007bff]"
          }`}>
            <FiAlertCircle size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#002f34] text-center">{title}</h2>
        </div>

        {/* Body Text */}
        <div className="px-6 pb-8">
          <p className="text-gray-500 text-[15px] leading-relaxed text-center">
            {message}
          </p>
        </div>

        {/* Full-Width Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose(); 
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              isDestructive 
                ? "bg-red-500 hover:bg-red-600 border border-transparent" 
                : "bg-[#002f34] hover:bg-[#004d55] border border-transparent"
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}