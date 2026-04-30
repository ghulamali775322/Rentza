import mongoose from "mongoose";
import Report from "../models/report.js";
import Listing from "../models/listing.js";
import User from "../models/user.js";

export const createReportService = async (reportData) => {
  const { reporterId, reportedListingId, reason, additionalComments } = reportData;

  const listing = await Listing.findById(reportedListingId);
  
  if (!listing) {
    throw new Error("Listing not found."); 
  }

  const newReport = new Report({
    reporterId: reporterId,
    reportedListingId: reportedListingId,
    reportedUserId: listing.lenderId, 
    reason: reason,
    additionalComments: additionalComments,
  });

  return await newReport.save();
};

// Admin Dashboard: Get count of PENDING reports
export const getPendingReportsCountService = async () => {
  const count = await Report.countDocuments({ status: 'pending' });
  return count;
};

export const getTotalReportsCountService = async () => {
  const count = await Report.countDocuments();
  return count;
};

export const getResolvedReportsCountService = async () => {
  const count = await Report.countDocuments({ status: "resolved" });
  return count;
};

// Admin Panel: Get reports filtered by status AND/OR search term
export const getAdminReportsService = async (statusFilter, searchTerm) => {
  let query = {};

  // 1. Tab Filter: (pending, resolved, dismissed)
  if (statusFilter) {
    query.status = statusFilter;
  }

  // 2. Search Bar Filter
  if (searchTerm) {
    const isMongoId = mongoose.Types.ObjectId.isValid(searchTerm);

    // Look up users whose name matches the search (For "Reporter Name")
    const matchingUsers = await User.find({
      name: { $regex: searchTerm, $options: "i" }
    }).select('_id');
    const userIds = matchingUsers.map(user => user._id);

    // Look up listings whose title matches the search (For "Reported Against")
    const matchingListings = await Listing.find({
      title: { $regex: searchTerm, $options: "i" }
    }).select('_id');
    const listingIds = matchingListings.map(listing => listing._id);

    // Build the "OR" logic
    let searchConditions = [
      { reason: { $regex: searchTerm, $options: "i" } } // Search by Reason
    ];

    // If it's a valid ID, allow searching by Report ID
    if (isMongoId) {
      searchConditions.push({ _id: searchTerm });
    }

    // Allow searching by Reporter
    if (userIds.length > 0) {
      searchConditions.push({ reporterId: { $in: userIds } });
    }

    // Allow searching by Listing Title
    if (listingIds.length > 0) {
      searchConditions.push({ reportedListingId: { $in: listingIds } });
    }

    query.$or = searchConditions;
  }
  
  // 3. Execute query and deeply populate the data for the frontend table
  const reports = await Report.find(query)
    .populate("reporterId", "name email") 
    .populate("reportedUserId", "name email") 
    .populate("reportedListingId", "title category") 
    .sort({ createdAt: -1 });

  return reports;
};

// Admin Panel: Get full details of a single report AND calculate user risk
export const getAdminReportByIdService = async (reportId) => {
  // 1. Fetch the report and deeply populate all related entities
  const report = await Report.findById(reportId)
    .populate("reporterId", "name email profilePhotoPath") 
    .populate("reportedUserId", "name email phone isActive") 
    .populate("reportedListingId", "title description price images status category");

  if (!report) {
    return null;
  }

  // 2. The Magic Step: Count how many total reports exist against this owner
  const totalReportsAgainstUser = await Report.countDocuments({
    reportedUserId: report.reportedUserId._id
  });

  // 3. Convert the Mongoose document to a plain JavaScript object
  // (We have to do this so we can attach our custom calculated number to it)
  const reportData = report.toObject();
  
  // 4. Attach the dynamic count to the data we are sending back
  reportData.totalReportsAgainstUser = totalReportsAgainstUser;

  return reportData;
};

// Admin Panel: Update report status (Dismiss, Resolve, Pending)
export const updateReportStatusService = async (reportId, newStatus) => {
  const updatedReport = await Report.findByIdAndUpdate(
    reportId, 
    { status: newStatus }, 
    { new: true }
  )
  .populate("reporterId", "name")
  .populate("reportedUserId", "name")
  .populate("reportedListingId", "title");
  
  return updatedReport;
};

// Admin Panel: Permanently delete a report
export const deleteReportService = async (reportId) => {
  return await Report.findByIdAndDelete(reportId);
};