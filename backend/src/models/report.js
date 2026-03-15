import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Offensive content",
        "Fraud",
        "Duplicate ad",
        "Wrong category",
        "Product unavailable",
        "Fake product",
        "Other",
      ],
    },

    additionalComments: {
      type: String,
      trim: true,
      maxLength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);
