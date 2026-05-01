import Conversation from "../models/conversation.js";
import mongoose from "mongoose";
import Message from "../models/message.js";
import { pusher } from "../config/pusher.js";

// 1. Fetch Inbox Logic (Updated to check unread messages)
export const getInboxService = async (userId) => {
  const conversations = await Conversation.find({ 
    participants: userId,
    deletedBy: { $ne: userId }
  })
    .populate("participants", "name email profilePhotoPath phone lastActive") 
    .populate("listingId", "title price images")           
    .sort({ updatedAt: -1 })
    .lean(); 

  const conversationsWithCounts = await Promise.all(conversations.map(async (chat) => {
    const unreadCount = await Message.countDocuments({
      conversationId: chat._id,
      senderId: { $ne: userId }, 
      isRead: false
    });

    return { ...chat, unreadCount };
  }));

  return conversationsWithCounts;
};

// 2. Fetch Messages Logic
export const getMessagesService = async (conversationId) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 });
};

// 3. Send Message & Pusher Logic (CRITICAL UPDATES)
export const sendMessageService = async (conversationId, senderId, text) => {
  // A. Save the message to DB
  const newMessage = await Message.create({
    conversationId, senderId, text, isRead: false,
  });

  // B. Update Conversation (Include isRead: false in lastMessage object)
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId, 
    {
      updatedAt: new Date(),
      lastMessage: { text, senderId, isRead: false }, // 👈 Store read status here
      $set: { deletedBy: [] } 
    },
    { new: true }
  ).populate("participants");

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // C. Identify the Receiver Safely
  const receiver = conversation.participants.find((p) => {
    const pId = p._id ? p._id.toString() : p.toString();
    return pId !== senderId.toString();
  });

  const receiverId = receiver ? (receiver._id ? receiver._id.toString() : receiver.toString()) : null;

  try {
    if (receiverId) {
      // 🔔 TRIGGER 1: Tells Navbar to show Red Badge instantly
      await pusher.trigger(`user-${receiverId}`, "update-badge", {
        hasUnread: true,
        senderId: senderId
      });

      // 🔔 TRIGGER 2: Extra trigger for sidebar/notification list
      await pusher.trigger(`user-${receiverId}`, "new-message", {
        senderId: senderId,
        text: text,
        conversationId
      });
    }

    // 💬 TRIGGER 3: Updates the active Chat Window (Messages)
    await pusher.trigger(`chat-${conversationId}`, "new-message", newMessage);

  } catch (pusherErr) {
    console.error("⚠️ Pusher Trigger Error:", pusherErr.message);
  }

  return newMessage;
};

// 4. Create or Find Conversation Logic
export const createConversationService = async (senderId, receiverId, listingId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    listingId: listingId
  });

  if (!conversation) {
    // A. Chat doesn't exist, create a brand new one
    conversation = await Conversation.create({
      participants: [senderId, receiverId], 
      listingId: listingId,
      lastMessage: { text: "", senderId: senderId, isRead: true }
    });
  } else {
    
    if (conversation.deletedBy && conversation.deletedBy.includes(senderId)) {
      conversation = await Conversation.findByIdAndUpdate(
        conversation._id,
        { $pull: { deletedBy: senderId } }, // Removes the user from the deleted list
        { new: true }
      );
    }
  }
  
  return conversation;
};

// 5. Mark messages as Read (CRITICAL UPDATES)
export const markMessagesAsReadService = async (conversationId, currentUserId) => {
  // A. Update all messages in this conversation as Read
  const result = await Message.updateMany(
    { conversationId: conversationId, senderId: { $ne: currentUserId }, isRead: false },
    { $set: { isRead: true } }
  );

  // B. Sync the Conversation model's lastMessage read status
  await Conversation.findByIdAndUpdate(conversationId, {
    "lastMessage.isRead": true
  });

  if (result.modifiedCount > 0) {
    try {
      // 🔔 TRIGGER 1: Tells Navbar to refresh (will hide Red Badge)
      await pusher.trigger(`user-${currentUserId}`, "update-badge", { refresh: true });
      
      // 🔔 TRIGGER 2: Tells the other user's Chat Window to show Blue Ticks
      await pusher.trigger(`chat-${conversationId}`, "messages-read", { conversationId });
    } catch (err) { 
      console.error("Pusher Error in MarkAsRead", err); 
    }
  }
  return result;
};

// 6. Soft Delete Chat Logic
export const deleteChatService = async (conversationId, userId) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    { $addToSet: { deletedBy: userId } },
    { new: true }
  );
};

export const getUnreadCountService = async (userId) => {
  // 👇 FIX 1: Force the string into a strict MongoDB ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find all conversations the user is part of
  const conversations = await Conversation.find({ participants: userObjectId });
  const conversationIds = conversations.map(c => c._id);
  
  // 👇 FIX 2: Now it accurately compares ObjectId against ObjectId
  const count = await Message.countDocuments({
    conversationId: { $in: conversationIds },
    senderId: { $ne: userObjectId }, 
    isRead: false
  });

  return count;
};