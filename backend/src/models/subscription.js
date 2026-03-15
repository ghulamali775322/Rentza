// backend/src/models/subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionType: {
    type: String,
    enum: ["free", "gold", "premium"], // updated
    required: true,
  },
  totalListing: { type: Number, required: true },
  paymentAmount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export default mongoose.model("Subscription", subscriptionSchema);
