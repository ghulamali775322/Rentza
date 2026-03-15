// backend/src/models/payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // user who made the payment
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  }, // which subscription this payment is for
  paymentAmount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  createdAt: { type: Date, required: true }, // date and time of payment
});

export default mongoose.model("Payment", paymentSchema);
