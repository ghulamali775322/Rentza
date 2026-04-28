import * as chatService from "../services/chatService.js";

export const getUserInbox = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await chatService.getInboxService(userId);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("❌ Inbox Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await chatService.getMessagesService(conversationId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ Messages Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const newMessage = await chatService.sendMessageService(conversationId, senderId, text);
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error); 
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update your createConversation function to this for 2 minutes:
export const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId, listingId } = req.body;
    const conversation = await chatService.createConversationService(senderId, receiverId, listingId);
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("❌ Create Conversation Error:", error);
    // 👇 Change this line so Postman shows the actual error!
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👇 NEW FEATURE: Controller to handle marking messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    
    if (!conversationId || !userId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await chatService.markMessagesAsReadService(conversationId, userId);
    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("❌ Mark Read Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// 👇 NEW: Controller to handle deleting a chat
export const deleteChat = async (req, res) => {
  try {
    const { conversationId, userId } = req.params; // Getting from URL this time
    
    if (!conversationId || !userId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await chatService.deleteChatService(conversationId, userId);
    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Chat Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// 👇 NEW: Controller to get total unread count for the red badge
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 👇 FIX: Stop React from crashing the server if it sends "undefined"
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(200).json({ success: true, count: 0 });
    }

    // Calling the service file to do the database math
    const count = await chatService.getUnreadCountService(userId);
    
    // Ensure we always return a clean number
    return res.status(200).json({ success: true, count: Number(count) || 0 });
  } catch (error) {
    console.error("❌ Unread Count Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};