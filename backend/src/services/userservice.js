import User from "../models/user.js";
import mongoose from "mongoose";
import Listing from "../models/listing.js";

// Admin Dashboard: Get total count of ALL registered users
export const getTotalUsersCountService = async () => {
  const count = await User.countDocuments({ role: "user" });
  return count;
};

// Admin Dashboard: Get count of ACTIVE users
export const getActiveUsersCountService = async () => {
  const count = await User.countDocuments({ role: "user", isActive: true });
  return count;
};


// Admin Panel: Get users filtered by status AND/OR search term, with total listings count
export const getAdminUsersService = async (isActiveFilter, searchTerm) => {
  let matchStage = { role: "user" };

  // 2. Tab Filter: (Active vs Inactive)
  if (isActiveFilter !== undefined) {
    matchStage.isActive = isActiveFilter === 'true'; // Converts the string "true" to a real boolean
  }

  // 3. Search Bar Filter
  if (searchTerm) {
    const isMongoId = mongoose.Types.ObjectId.isValid(searchTerm);
    
    let searchConditions = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } }
    ];

    if (isMongoId) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm) });
    }

    matchStage.$or = searchConditions;
  }

  // 4. The Aggregation Pipeline (The Magic Trick)
  const users = await User.aggregate([
    { $match: matchStage }, 
    {
      // Look inside the 'listings' collection and find all listings owned by this user
      $lookup: {
        from: "listings", 
        localField: "_id",
        foreignField: "lenderId",
        as: "userListings"
      }
    },
    {
      // Count how many listings we found and create a new "totalListings" field
      $addFields: {
        totalListings: { $size: "$userListings" }
      }
    },
    {
      // Security: Strip out passwords and tokens, and remove the bulky listings array
      $project: {
        passwordHash: 0,
        verificationToken: 0,
        resetPasswordToken: 0,
        userListings: 0 
      }
    },
    { $sort: { createdAt: -1 } } 
  ]);

  return users;
};

// Admin Panel: Get full details of a single user
export const getAdminUserDetailsService = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash -verificationToken -resetPasswordToken");
  return user;
};

// Admin Panel: Get all listings owned by a specific user
export const getAdminUserListingsService = async (userId) => {
  const userListings = await Listing.find({ lenderId: userId })
    .sort({ createdAt: -1 }); 
    
  return userListings;
};

// Admin Panel: Suspend or Unsuspend a user
export const updateUserStatusService = async (userId, isActiveStatus) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId, 
    { isActive: isActiveStatus }, 
    { new: true }
  ).select("-passwordHash -verificationToken -resetPasswordToken");
  
  return updatedUser;
};

// Admin Panel: Permanently delete a user
export const deleteUserService = async (userId) => {
  return await User.findByIdAndDelete(userId);
};