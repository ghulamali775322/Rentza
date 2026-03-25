import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }, // Added this so we can show "Unread" badges later!
  },
  { timestamps: true }, // Automatically creates 'createdAt' (replaces sentAt)
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
