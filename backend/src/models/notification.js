import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      // WE ADDED "listing_update" RIGHT HERE:
      enum: [
        "listing_status",
        "listing_update",
        "report_update",
        "account_update",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
