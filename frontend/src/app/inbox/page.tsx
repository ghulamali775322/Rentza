"use client";
import ProtectedRoute from "@/components/ProtectedRoute";

import React, { useState } from "react";
import { FiMessageSquare, FiSend, FiX, FiMoreVertical } from "react-icons/fi"; // Icons
import ReportModal from "@/components/modals/ReportModal";
import { MdChatBubble } from "react-icons/md"; // Example modern chat icon

// --- DUMMY DATA ---
const DUMMY_MESSAGES = [
  {
    id: 1,
    text: "Hello! Is the iPhone 6 still available for rent next week?",
    sender: "other",
    time: "10:05 AM",
  },
  {
    id: 2,
    text: "Yes, it is! What days are you looking for? The condition is excellent.",
    sender: "you",
    time: "10:07 AM",
  },
  {
    id: 3,
    text: "I need it Thursday to Saturday. What's the total rental price? I can pick up from your location.",
    sender: "other",
    time: "10:15 AM",
  },
  {
    id: 4,
    text: "The total price for those 3 days is PKR 4,500. We can meet tomorrow. Please confirm if 4 PM works for you.",
    sender: "you",
    time: "10:18 AM",
  },
];

// --- COMPONENT ---
export default function InboxPage() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Placeholder data for the chat list
  const chats = [
    { id: 1, name: "Faisal Hayat" },
    { id: 2, name: "Ali Khan" },
    { id: 3, name: "Sana Malik" },
    { id: 4, name: "Bike Rental Co." },
    { id: 5, name: "Outdoor Gear Seller" },
  ];

  const activeChatData = chats.find((chat) => chat.id === activeChat);

  return (
    <ProtectedRoute>
      // InboxLayout
      <div className="flex max-w-[1200px] mx-auto border border-[#ddd] rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] bg-white mt-5 h-[80vh] overflow-hidden">
        {/* LEFT SIDEBAR: Chat List (ChatSidebar) */}
        <div className="w-[350px] border-r border-[#eee] overflow-y-auto bg-[#f8f9fa] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-thumb]:rounded-[3px]">
          {/* InboxHeader */}
          <div className="px-5 py-[15px] text-[20px] font-bold text-[#002f34] border-b border-[#eee] w-full box-border">
            INBOX
          </div>

          {chats.map((chat) => (
            // ChatItem
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-center px-5 py-[15px] cursor-pointer border-b border-[#f0f0f0] transition-colors duration-100 hover:bg-[#e6f7ff] ${activeChat === chat.id ? "bg-[#e6f7ff]" : "bg-white"}`}
            >
              {/* UserAvatar */}
              <div className="w-10 h-10 rounded-full bg-[#f2f7ff] flex items-center justify-center mr-[15px] text-black text-[20px]">
                {chat.name.charAt(0)}
              </div>

              {/* Name */}
              <div className="flex-grow text-left">
                <div className="font-semibold text-[#002f34]">{chat.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: Conversation Area (ChatArea) */}
        <div className="flex-grow flex flex-col justify-between items-center bg-white">
          {activeChat ? (
            <div className="w-full h-full flex flex-col justify-between">
              {/* --- Conversation Header --- */}
              <div className="px-5 py-[15px] border-b border-[#eee] text-[#002f34] flex justify-between items-center">
                {/* Left Side: Name */}
                <div>
                  <div className="text-base font-bold">
                    {activeChatData?.name}
                  </div>
                  <div className="text-[13px] font-medium text-[#555] mt-[3px]">
                    {/* Status or details could go here */}
                  </div>
                </div>

                {/* Right Side: Icons and Dropdown Menu */}
                <div className="flex gap-[15px] text-[#555] relative">
                  {/* Menu Toggler */}
                  <div className="relative">
                    <FiMoreVertical
                      size={22}
                      className="cursor-pointer"
                      onClick={() => setShowOptionsMenu((prev) => !prev)}
                    />

                    {/* Menu Dropdown Content (OptionsMenu) */}
                    {showOptionsMenu && (
                      <div className="absolute top-10 right-1 bg-white border border-[#ddd] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[200] min-w-[150px] py-[5px]">
                        {/* MenuItem */}
                        <div
                          className="px-[15px] py-[10px] text-sm text-[#333] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#007bff]"
                          onClick={() => {
                            alert("Chat Deleted (Demo)");
                            setShowOptionsMenu(false);
                            setActiveChat(null);
                          }}
                        >
                          Delete Chat
                        </div>
                        {/* MenuItem: Report User */}
                        <div
                          className="px-[15px] py-[10px] text-sm text-[#333] cursor-pointer hover:bg-[#f0f0f0] hover:text-[#007bff]"
                          onClick={() => {
                            setIsReportOpen(true); // <--- CHANGE THIS (Opens the modal)
                            setShowOptionsMenu(false);
                          }}
                        >
                          Report User
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cross Mark */}
                  <span
                    onClick={() => setActiveChat(null)}
                    className="cursor-pointer flex items-center"
                  >
                    <FiX size={24} />
                  </span>
                </div>
              </div>

              {/* --- Message Display Area --- */}
              <div className="p-5 flex-grow overflow-y-auto">
                {/* MessageWrapper */}
                <div className="flex flex-col w-full">
                  {DUMMY_MESSAGES.map((msg) => (
                    // MessageBubble
                    <div
                      key={msg.id}
                      className={`
                      px-[15px] py-[10px] rounded-[18px] max-w-[65%] break-words my-[5px] text-[15px] text-left
                      ${
                        msg.sender === "you"
                          ? "bg-[#007bff] text-white self-end"
                          : "bg-[#f0f0f0] text-[#333] self-start"
                      }
                    `}
                    >
                      {msg.text}
                      {/* Time stamp */}
                      <div
                        className={`text-[10px] opacity-70 mt-[3px] ${msg.sender === "you" ? "text-right" : "text-left"}`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Input Box --- */}
              <div className="px-5 py-[15px] border-t border-[#eee] flex gap-[10px]">
                <textarea
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-grow p-[10px] rounded border border-[#ccc] resize-none min-h-[40px]"
                />
                <button className="bg-[#002f34] text-white px-[15px] py-[10px] rounded border-none cursor-pointer flex items-center">
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          ) : (
            // ChatPlaceholder
            <div className="text-black text-base mt-0 w-full h-full flex flex-col justify-center items-center">
              <FiMessageSquare size={70} className="text-[#55abff] mb-[15px]" />
              <div className="text-[#555] text-base">
                Select a chat to view conversation
              </div>
            </div>
          )}
        </div>
        {activeChatData && (
          <ReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            type="user"
            id={activeChatData.id} // Passes the ID of the user you are chatting with
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
