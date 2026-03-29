"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FiBell, FiCheck, FiCheckCircle, FiInfo } from "react-icons/fi";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH ALL NOTIFICATIONS ---
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      const response = await fetch(`http://localhost:5000/api/notifications?t=${Date.now()}`, {
        headers: headers,
      });
      const result = await response.json();

      if (result.success) {
        // THE FIX: Force Javascript to aggressively sort Newest First
        const sortedData = result.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sortedData);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- THE FIX: LISTEN FOR CLICKS FROM NAVBAR ---
  useEffect(() => {
    window.addEventListener("syncNotifications", fetchNotifications);
    return () => window.removeEventListener("syncNotifications", fetchNotifications);
  }, [fetchNotifications]);


  // --- MARK SINGLE NOTIFICATION AS READ ---
  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Don't do anything if it's already read

    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: headers,
      });

      // Update UI Instantly
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      
      // THE FIX: Tell the Navbar to instantly drop the red badge number!
      window.dispatchEvent(new Event("syncNotifications"));

    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // --- MARK ALL AS READ ---
  const handleMarkAllAsRead = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
      else if (session?.user?.email) headers["x-google-email"] = session.user.email;

      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: headers,
      });

      // Update UI Instantly
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      // THE FIX: Tell the Navbar to instantly drop the red badge to zero!
      window.dispatchEvent(new Event("syncNotifications"));

    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ProtectedRoute>
      <div className="max-w-[800px] mx-auto py-10 px-5 min-h-screen pt-[30px]">
        
        {/* HEADER SECTION */}
        <div className="border-b border-[#eee] pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#002f34] flex items-center gap-3">
              <FiBell className="text-[#0077ff]" /> Notifications
            </h1>
            <p className="text-gray-500 mt-1">
              You have <span className="font-bold text-[#0077ff]">{unreadCount}</span> unread messages.
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 text-sm font-semibold text-[#0077ff] bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
            >
              <FiCheckCircle size={16} /> Mark all as read
            </button>
          )}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500 font-bold animate-pulse">
              Loading your notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiBell className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">You're all caught up!</h3>
              <p className="text-gray-500 mt-2">No new notifications to display right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                  className={`p-5 transition-colors cursor-pointer flex gap-4 ${
                    notif.isRead ? "bg-white hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  <div className="shrink-0 mt-1">
                    {notif.isRead ? (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <FiCheck size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0077ff]">
                        <FiInfo size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-base ${notif.isRead ? "font-semibold text-gray-700" : "font-bold text-gray-900"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${notif.isRead ? "text-gray-500" : "text-gray-800"}`}>
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center justify-center">
                      <span className="w-3 h-3 bg-[#0077ff] rounded-full shadow-sm"></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}