import mongoose from "mongoose";
import Listing from "../models/listing.js";
import User from "../models/user.js";

//create listing
export const createListingService = async (data) => {
  const listing = await Listing.create(data);
  return listing;
};

//get all listing
export const getAllListings = async () => {
  // THE FIX: Added { status: "active" } so pending ads are completely hidden from the public!
  const listings = await Listing.find({ status: "active" }).populate(
    "lenderId",
    "name email",
  );
  return listings;
};

// Get a single listing by its ID
export const getListingByIdService = async (id) => {
  const listing = await Listing.findById(id).populate(
    "lenderId",
    "name email phone profilePhotoPath",
  );
  return listing;
};

// Get all ACTIVE listings for a specific lender (Public Profile)
export const getListingsByLenderService = async (lenderId) => {
  // Added { status: 'active' } so the public never sees pending ads!
  const listings = await Listing.find({
    lenderId: lenderId,
    status: "active",
  }).populate("lenderId", "name email profilePhotoPath");
  return listings;
};

// NEW: Get ALL listings (Active + Pending) for the private "My Ads" dashboard
export const getMyListingsService = async (lenderId) => {
  const listings = await Listing.find({ lenderId: lenderId }).populate(
    "lenderId",
    "name email",
  );
  return listings;
};

// Update a listing
// Update a listing, including removing images
export const updateListingService = async (id, updatedData) => {
  const { removedImages, ...otherData } = updatedData;

  // 1. Remove images if any
  if (removedImages && removedImages.length > 0) {
    await Listing.updateOne(
      { _id: id },
      { $pull: { images: { _id: { $in: removedImages } } } },
    );
    // Optionally: remove files from disk/cloud if needed
  }

  // 2. Update other fields
  const updatedListing = await Listing.findByIdAndUpdate(id, otherData, {
    new: true,
  });

  return updatedListing;
};

// Delete a listing
export const deleteListingService = async (id) => {
  const deletedListing = await Listing.findByIdAndDelete(id);
  return deletedListing;
};

// Remove a specific image from a listing's image array
export const deleteListingImageService = async (listingId, imageUrl) => {
  const updatedListing = await Listing.findByIdAndUpdate(
    listingId,
    { $pull: { images: { url: imageUrl } } },
    { new: true },
  );
  return updatedListing;
};

// Admin Dashboard: Get total count of ALL listings
export const getTotalListingsCountService = async () => {
  const count = await Listing.countDocuments();
  return count;
};

// Admin Dashboard: Get count of ACTIVE listings
export const getActiveListingsCountService = async () => {
  const count = await Listing.countDocuments({ status: "active" });
  return count;
};

// Admin Dashboard: Get count of PENDING listings
export const getPendingListingsCountService = async () => {
  const count = await Listing.countDocuments({ status: "pending" });
  return count;
};

// Admin Panel: Get listings filtered by status AND/OR search term
export const getAdminListingsService = async (statusFilter, searchTerm) => {
  let query = {};

  if (statusFilter) {
    query.status = statusFilter;
  }

  if (searchTerm) {
    const isMongoId = mongoose.Types.ObjectId.isValid(searchTerm);

    const matchingUsers = await User.find({
      name: { $regex: searchTerm, $options: "i" },
    }).select("_id");

    const userIds = matchingUsers.map((user) => user._id);

    let searchConditions = [
      { title: { $regex: searchTerm, $options: "i" } },
      { category: { $regex: searchTerm, $options: "i" } },
    ];

    if (isMongoId) {
      searchConditions.push({ _id: searchTerm });
    }

    if (userIds.length > 0) {
      searchConditions.push({ lenderId: { $in: userIds } });
    }

    query.$or = searchConditions;
  }

  const listings = await Listing.find(query)
    .populate("lenderId", "name email")
    .sort({ createdAt: -1 });

  return listings;
};

// Admin Panel: Get full, unredacted details of a single listing
export const getAdminListingByIdService = async (listingId) => {
  const listing = await Listing.findById(listingId).populate(
    "lenderId",
    "name email phone profilePhotoPath",
  );
  return listing;
};

// Admin Panel: Update a listing's status (Approve, Activate, Suspend)
export const updateListingStatusAdminService = async (listingId, newStatus) => {
  const updatedListing = await Listing.findByIdAndUpdate(
    listingId,
    { status: newStatus },
    { new: true },
  );
  return updatedListing;
};
// Search listings (Strictly using MongoDB Geospatial $geoNear)
export const searchListingsService = async (keyword, lat, lng, category, subCategory, locationString) => {
  let pipeline = [];

  // 1. MUST BE FIRST: Geospatial $geoNear query
  if (lat && lng) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitude, Latitude]
        },
        distanceField: "distance", 
        spherical: true,
        distanceMultiplier: 0.001 
      }
    });
  }

  // 2. Build standard filters
  // 🛡️ CRITICAL: Always filter by "active" so pending ads don't show up!
  let matchStage = { status: "active" };

  if (keyword) {
    matchStage.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { subCategory: { $regex: keyword, $options: "i" } }
    ];
  }

  if (category) {
    matchStage.category = { $regex: category, $options: "i" };
  }

  if (subCategory) {
    matchStage.subCategory = { $regex: subCategory, $options: "i" };
  }

  // Fallback text location if NO GPS is provided
  if (!lat && !lng && locationString && locationString !== "Pakistan") {
    const cityName = locationString.split(',')[0].replace(" City", "").trim();
    matchStage.address = { $regex: cityName, $options: "i" };
  }

  // Always push the match stage
  pipeline.push({ $match: matchStage });

  // 3. 🚀 THE FIX: Mimic .populate("lenderId") so the frontend doesn't crash!
  pipeline.push({
    $lookup: {
      from: "users", // Looks inside your Users collection
      localField: "lenderId",
      foreignField: "_id",
      as: "lenderId"
    }
  });

  // Flattens the array so it acts exactly like a normal populated object
  pipeline.push({
    $unwind: {
      path: "$lenderId",
      preserveNullAndEmptyArrays: true
    }
  });

  // Execute the pipeline!
  const listings = await Listing.aggregate(pipeline);
  return listings;
};