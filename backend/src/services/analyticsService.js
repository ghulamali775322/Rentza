import Listing from "../models/listing.js";
import User from "../models/user.js";

// Admin Panel: Get monthly listing creation counts for the growth chart
export const getListingsGrowthService = async () => {
  const growthData = await Listing.aggregate([
    {
      // Step 1: Group the listings by the Year and Month they were created
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 } 
      }
    },
    {
      // Step 2: Sort them chronologically (oldest to newest)
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  // Step 3: Format the data so the frontend charts can easily read it
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formattedData = growthData.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`, // e.g., "Feb 2026"
    listings: item.count
  }));

  return formattedData;
};

// Admin Panel: Get monthly user sign-ups for the growth chart
export const getUserGrowthService = async () => {
  const growthData = await User.aggregate([
    {
      // Step 1: Filter out admins. We only want to count actual "user" sign-ups!
      $match: { role: "user" }
    },
    {
      // Step 2: Group the users by the Year and Month they joined
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 } 
      }
    },
    {
      // Step 3: Sort them chronologically (oldest to newest)
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  // Step 4: Format the data perfectly for the Recharts frontend
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formattedData = growthData.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    users: item.count
  }));

  return formattedData;
};