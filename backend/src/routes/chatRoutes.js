import express from "express";
import { 
  getUserInbox, 
  getMessages, 
  sendMessage, 
  createConversation,
  markAsRead, // 👈 NEW: Imported the new controller
  deleteChat,
  getUnreadCount
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/inbox/:userId", getUserInbox);
router.get("/messages/:conversationId", getMessages);
router.post("/send", sendMessage);
router.post("/create", createConversation);
// 👇 NEW: Route to update blue ticks
router.put("/read", markAsRead);
// 👇 2. ADD THIS NEW ROUTE
router.delete("/:conversationId/:userId", deleteChat);
// 👇 2. ADD THIS NEW ROUTE FOR THE RED BADGE NUMBER
router.get("/unread-count/:userId", getUnreadCount);

export default router;