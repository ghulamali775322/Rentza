"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, MoreVertical, User, Phone, Check,} from 'lucide-react'; 
import Pusher from 'pusher-js';
import ReportModal from "@/components/modals/ReportModal"; 
import { useSession } from "next-auth/react"; //  NEW: Added session
import { notFound, useRouter, useSearchParams } from "next/navigation";  // NEW: Added router for redirects

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- CONFIGURATION ---
  const BACKEND_URL = "http://localhost:5000"; 
  const PUSHER_KEY = "8007c29c16276e840f53"; 
  const PUSHER_CLUSTER = "ap2";

  // --- STATES ---
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); //  NEW: Real dynamic user ID
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showNumber, setShowNumber] = useState(false);
  
  // Dynamic States for Real Data
  const [chats, setChats] = useState<any[]>([]); 
  const [messages, setMessages] = useState<any[]>([]); 
  const [pusherLoaded, setPusherLoaded] = useState(false);
  const hasAutoOpened = useRef(false);

  // --- 0. FIND THE REAL LOGGED-IN USER ---
  useEffect(() => {
    const resolveUserId = async () => {
      let id = (session?.user as any)?.id || (session?.user as any)?._id;
      const localToken = localStorage.getItem("token");
      const googleEmail = session?.user?.email;

      // Ask backend for true ID if missing
      if (!id && (localToken || googleEmail)) {
        try {
          const headers: HeadersInit = {};
          if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
          else if (googleEmail) headers["x-google-email"] = googleEmail;

          const profileRes = await fetch(`${BACKEND_URL}/profile`, { headers });
          const profileData = await profileRes.json();
          id = profileData?.user?._id || profileData?.user?.id;
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      }

      if (id) {
        setCurrentUserId(id);
      } else if (status === "unauthenticated" && !localToken) {
        // If they are completely logged out, send them home!
        router.push("/");
      }
    };

    if (status !== "loading") {
      resolveUserId();
    }
  }, [session, status, router]);


  // --- DYNAMIC PUSHER SCRIPT LOADER ---
  useEffect(() => {
    if (!(window as any).Pusher) {
      const script = document.createElement('script');
      script.src = 'https://js.pusher.com/8.0.1/pusher.min.js';
      script.async = true;
      script.onload = () => setPusherLoaded(true);
      document.head.appendChild(script);
    } else {
      setPusherLoaded(true);
    }
  }, []);
  useEffect(() => {
    const chatToOpen = searchParams.get('open');
    
    
    if (chatToOpen && chats.length > 0 && !hasAutoOpened.current) {
      const exists = chats.some(c => c._id === chatToOpen);
      if (exists) {
        setActiveChat(chatToOpen); 
        
        hasAutoOpened.current = true;
        router.replace('/inbox'); 
      }
    }
  }, [searchParams, chats, router]);

  // --- 1. FETCH INBOX (On Page Load) ---
  const fetchInbox = async () => {
    if (!currentUserId) return; 
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/inbox/${currentUserId}`);
      const result = await res.json();
      if (result.success) {
        setChats(result.data);
      }
    } catch (err) {
      console.error("Inbox fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [currentUserId]); 

  // --- SIDEBAR PUSHER REALTIME LISTENER ---
  useEffect(() => {
    if (!pusherLoaded || !currentUserId) return;

    (window as any).Pusher.logToConsole = true;

    const pusher = new (window as any).Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    const userChannel = pusher.subscribe(`user-${currentUserId}`);

    userChannel.bind("update-badge", () => fetchInbox());
    userChannel.bind("new-message", () => fetchInbox());

    return () => {
      pusher.unsubscribe(`user-${currentUserId}`);
      pusher.disconnect();
    };
  }, [pusherLoaded, currentUserId]);

  // --- 2. FETCH HISTORY & PUSHER LISTENER (When Chat Opens) ---
  useEffect(() => {
    if (!activeChat || !currentUserId) return;
    
    setShowNumber(false);
    setShowOptionsMenu(false);

    // A. Fetch Chat History
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/messages/${activeChat}`);
        const result = await res.json();
        
        if (Array.isArray(result)) {
          setMessages(result);
        } else if (result.success) {
          setMessages(result.data || result.messages || []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Message history fetch failed:", err);
      }
    };
    fetchMessages();

    // B. Tell Backend we read the messages!
    const markAsRead = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/chat/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeChat, userId: currentUserId })
        });
      } catch (err) { console.error("Mark read failed", err); }
    };
    markAsRead();

    // C. Setup Pusher "Antenna"
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    const channelName = `chat-${activeChat}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (incomingMessage: any) => {
      setMessages((prev) => { 
        if (prev.some(m => m._id === incomingMessage._id)) return prev;
        return [...prev, incomingMessage];
      }); 
      
      if (incomingMessage.senderId !== currentUserId) {
         markAsRead();
      }
    });

    channel.bind("messages-read", () => {
      setMessages((prev) => prev.map(msg => ({ ...msg, isRead: true })));
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [activeChat, currentUserId]);

  // --- 3. SEND MESSAGE FUNCTION ---
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || !currentUserId) return;

    const textToSend = messageText;
    setMessageText(""); 

    try {
      const payload = {
        conversationId: activeChat,
        senderId: currentUserId, // 👈 Using real ID
        text: textToSend, 
      };
      
      const response = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === result.data._id)) return prev;
          return [...prev, result.data];
        });
        fetchInbox(); 
      }
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  // --- 4. DELETE CHAT FUNCTION ---
  const handleDeleteChat = async () => {
    if (!activeChat || !currentUserId) return;

    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${activeChat}/${currentUserId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setChats(prev => prev.filter(c => c._id !== activeChat));
        setActiveChat(null);
        setShowOptionsMenu(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const activeChatData = chats.find(c => c._id === activeChat);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPER FUNCTIONS FOR REAL TIME ---
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastActive = (dateString: string) => {
    if (!dateString) return "Active recently"; // Fallback if no date exists in database
    
    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Active just now";
    if (diffInMinutes < 60) return `Last active ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInHours < 24) return `Last active ${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return `Last active ${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  const formatDateLabel = (dateString: string) => {
    const msgDate = new Date(dateString);
    const today = new Date();

    if (msgDate.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return msgDate.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleChatSelect = (chatId: string) => {
  console.log("Opening chat:", chatId); 
  setActiveChat(chatId); 
  
  
  setChats(prevChats =>
    prevChats.map(chat =>
      chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
    )
  );
};

  
  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center h-[80vh] mt-5">
        <p className="text-gray-500 font-bold text-lg animate-pulse">Loading Inbox...</p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[1200px] mx-auto md:border border-[#ddd] md:rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] bg-white fixed md:relative top-[180px] md:top-auto bottom-[56px] md:bottom-auto left-0 right-0 w-full md:mt-5 md:h-[80vh] overflow-hidden z-30">
     {/* --- LEFT SIDEBAR (Inbox List) --- */}
      
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] md:min-w-[350px] shrink-0 md:border-r-2 border-[#eee] bg-white flex-col h-full z-10`}>
        
        {/*  FIX 2: INBOX Header stays STATIC (shrink-0 means it never squishes or scrolls) */}
        <div className="px-5 py-[15px] text-[23px] font-bold text-[#002f34] border-b border-[#eee] w-full shrink-0 bg-white z-10 shadow-sm">
          INBOX
        </div>
        
        {/*  FIX 3: ONLY the chat list scrolls! (flex-1 takes remaining space) */}
        <div className="flex-1 overflow-y-auto bg-white [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-thumb]:rounded-[3px]">
          {chats.length > 0 ? chats.map(chat => {
            const otherUser = chat.participants.find((p: any) => String(p._id) !== currentUserId);
            const isUnread = chat.unreadCount > 0; 
            return (
              <div 
                key={chat._id} 
                onClick={(e) => {
                  e.preventDefault();
                  handleChatSelect(chat._id);
                }}
                // Highlight color stays when active
                className={`flex items-center px-5 py-[15px] cursor-pointer border-b border-[#eee] transition-colors relative ${
                  activeChat === chat._id ? 'bg-[#f2f4f5]' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-[45px] h-[45px] min-w-[45px] rounded-full bg-[#1877f2] flex items-center justify-center mr-[15px] text-white font-bold text-lg relative shrink-0 overflow-hidden border border-gray-200"> 
                  {otherUser?.profilePhotoPath ? (
                    <img 
                      src={otherUser.profilePhotoPath.startsWith("http") ? otherUser.profilePhotoPath : `${BACKEND_URL}${otherUser.profilePhotoPath}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    otherUser?.name?.charAt(0) || <User size={20} />
                  )}
                </div>
                
                <div className="flex flex-col flex-grow min-w-0"> 
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#002f34] text-[15px] truncate mr-2">
                      {otherUser?.name || "Unknown User"}
                    </span>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      {chat.updatedAt ? formatTime(chat.updatedAt) : ""}
                    </span>
                  </div>
                  <div className="text-[13px] font-bold text-[#002f34] truncate">
                    {chat.listingId?.title || "Ad Title"}
                  </div>
                  <div className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5 min-w-0">
                    {chat.lastMessage?.senderId === currentUserId && (
                      <Check size={12} className="text-gray-400 shrink-0" />
                    )}
                    <span className={`truncate ${isUnread ? 'font-bold text-gray-900 italic' : 'text-gray-400'}`}>
                      {chat.lastMessage?.text || "No messages yet"}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-10 text-center text-gray-400 text-sm">No conversations yet</div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
     <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-grow flex-col bg-white w-full fixed md:relative top-[175px] md:top-auto bottom-[75px] md:bottom-auto left-0 right-0 md:left-auto md:right-auto md:h-full z-[40] md:z-20`}>
        {activeChat ? (
          <div className="w-full h-full flex flex-col justify-between">
            
           {/* Header */}
            <div className="px-3 md:px-5 py-[12px] border-b border-[#eee] bg-white flex justify-between items-center z-10 w-full">
              <div className="flex items-center gap-2 md:gap-3">
                
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setActiveChat(null)} 
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
               <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold shrink-0 relative overflow-hidden border border-gray-200">
                  
                  {/* Layer 1: First letter underneath */}
                  <span className="absolute z-0">
                    {activeChatData?.participants.find((p: any) => String(p._id) !== currentUserId)?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  
                  {/* Layer 2: Image on top */}
                  {(() => {
                    const chatUser = activeChatData?.participants.find((p: any) => String(p._id) !== currentUserId);
                    if (chatUser?.profilePhotoPath) {
                      return (
                        <img 
                          src={chatUser.profilePhotoPath.startsWith("http") ? chatUser.profilePhotoPath : `${BACKEND_URL}${chatUser.profilePhotoPath}`} 
                          alt="" 
                          className="w-full h-full object-cover z-10 relative bg-[#1877f2]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'; // Hides the broken image
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-[#002f34]">
                     {activeChatData?.participants.find((p: any) => String(p._id) !== currentUserId)?.name || "Unknown User"}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {formatLastActive(activeChatData?.participants.find((p: any) => String(p._id) !== currentUserId)?.lastActive)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-[15px] text-[#002f34] relative">
                {showNumber ? (
                  <span className="text-sm font-bold text-[#1877f2] bg-blue-50 px-2 py-1 rounded">
                    {activeChatData?.participants.find((p: any) => String(p._id) !== currentUserId)?.phone || "No Number Provided"}
                  </span>
                ) : (
                  <Phone size={20} className="cursor-pointer hover:text-[#1877f2] transition" onClick={() => setShowNumber(true)} />
                )}

                <div className="relative" ref={optionsMenuRef}>
                    <MoreVertical size={22} className="cursor-pointer" onClick={() => setShowOptionsMenu(!showOptionsMenu)} />
                    {showOptionsMenu && (
                        <div className="absolute top-10 right-1 bg-white border border-[#ddd] rounded-md shadow-lg z-[200] min-w-[150px] py-[5px]">
                           <div className="px-[15px] py-[10px] text-sm cursor-pointer hover:bg-red-50 text-red-600 font-medium" onClick={handleDeleteChat}>Delete Chat</div>
                        </div>
                    )}
                </div>
                <X size={26} className="cursor-pointer" onClick={() => setActiveChat(null)} />
              </div>
            </div>
            
            {/* Messages */}
            <div className="p-5 flex-grow overflow-y-auto bg-[#f2f4f5]">
              <div className="flex flex-col w-full gap-[6px]">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId; //  Checked against real ID
                  const prevMsg = messages[index - 1];

                  const showDate =
                    !prevMsg ||
                    new Date(prevMsg.createdAt).toDateString() !==
                      new Date(msg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-6 py-1 border border-gray-300 rounded-full text-[11px] font-bold text-gray-600 uppercase">
                            {formatDateLabel(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-[12px] py-[6px] rounded-[6px] max-w-[65%] break-words text-[14px] flex items-end gap-3 shadow-sm
                        ${
                          isMe
                            ? "bg-[#e0ebfc] text-[#002f34] self-end rounded-br-none"
                            : "bg-white text-[#002f34] self-start rounded-bl-none border border-gray-100"
                        }`}
                      >
                        <div className="pb-[2px]">{msg.text}</div>

                        <div className="text-[10px] text-gray-500 flex items-center gap-[2px] shrink-0 whitespace-nowrap mb-[2px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}

                          {isMe && (
                            msg.isRead ? (
                              <svg viewBox="0 0 16 15" width="17" height="17" className="text-[#3ba6f6] shrink-0" fill="currentColor">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 16 15" width="17" height="17" className="text-gray-400 shrink-0" fill="currentColor">
                                <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                              </svg>
                            )
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            {/* Input */}
            <div className="px-3 md:px-5 py-[12px] border-t border-[#eee] flex gap-[10px] bg-white w-full">
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message..." 
                className="flex-grow p-[10px] rounded-full border border-[#ccc] resize-none focus:border-[#007bff] outline-none px-4"
                rows={1}
              />
              <button onClick={handleSendMessage} className="bg-[#002f34] text-white px-[18px] rounded-full hover:bg-black transition flex items-center justify-center shadow-md">
                <Send size={18} className="-ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={70} className="text-[#55abff] mb-4 opacity-20" />
            <div className="text-gray-400 font-medium">Select a chat to view conversation</div>
          </div>
        )}
      </div>

      {activeChatData && (
        <ReportModal 
          isOpen={isReportOpen} 
          onClose={() => setIsReportOpen(false)} 
          type="user" 
          id={activeChatData._id} 
        />
      )}
    </div>
  );
}