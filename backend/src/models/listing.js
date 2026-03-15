import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        url: { type: String, required: true },
        status: {
          type: String,
          enum: ["approved", "pending"],
          default: "pending",
        },
      },
    ],

    // FIXED LOCATION FOR SEARCH & DISCOVERY
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude] - REQUIRED for Radar Search
        required: true,
      },
    },
  },
  { timestamps: true },
);
// CRITICAL: This line allows the "Near Me" search to work!
listingSchema.index({ location: "2dsphere" });

export default mongoose.model("Listing", listingSchema);
