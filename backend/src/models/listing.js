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
    contactNumber: {
      type: String,
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        status: {
          type: String,
          enum: ["approved", "pending", "rejected"],
          default: "pending",
        },
      },
    ],
    // --- NEW ADMIN CONTROL STATUS ---
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending", // All new listings wait in the "waiting room"
    },
    // --- LOCATION DATA ---
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

listingSchema.index({ location: "2dsphere" });

// Check if the model already exists before creating a new one!
const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);

export default Listing;
