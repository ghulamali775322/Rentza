import { getTotalUsersCountService } from "../services/userService.js";
import { getActiveUsersCountService } from "../services/userService.js";
import { getAdminUsersService } from "../services/userService.js";
import { getAdminUserDetailsService } from "../services/userService.js";
import { getAdminUserListingsService } from "../services/userService.js"
import { updateUserStatusService } from "../services/userService.js"
import { deleteUserService } from "../services/userService.js";
import { getTotalListingsCountService } from "../services/listingService.js";
import { getActiveListingsCountService } from "../services/listingService.js";
import { getPendingListingsCountService } from "../services/listingService.js";
import { getAdminListingsService } from "../services/listingService.js";
import { getAdminListingByIdService } from "../services/listingService.js";
import { updateListingStatusAdminService } from "../services/listingService.js";
import {deleteListingService } from "../services/listingService.js";
import { updateListingService } from "../services/listingService.js";
import { createNotificationService } from "../services/notificationService.js";
import { getPendingReportsCountService } from "../services/reportService.js";
import { getAdminReportsService } from "../services/reportService.js";
import { getAdminReportByIdService } from "../services/reportService.js";
import User from "../models/user.js";
import { updateReportStatusService } from "../services/reportService.js";
import { deleteReportService } from "../services/reportService.js";
import { getListingsGrowthService } from "../services/analyticsService.js";
import { getUserGrowthService } from "../services/analyticsService.js";

export const getDashboardStats = async (req, res) => {
  try {
  
    const totalListings = await getTotalListingsCountService();
    const activeListings = await getActiveListingsCountService();
    const pendingListings = await getPendingListingsCountService();
    const pendingReports = await getPendingReportsCountService();
    const totalUsers = await getTotalUsersCountService();
    const activeUsers = await getActiveUsersCountService();


    res.status(200).json({
      success: true,
      data: {
        totalListings: totalListings,
        activeListings: activeListings,
        pendingListings: pendingListings,
        pendingReports: pendingReports,
        totalUsers: totalUsers, 
        activeUsers: activeUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAdminListings = async (req, res) => {
  try {
    
    const { status, search } = req.query; 

    
    const listings = await getAdminListingsService(status, search);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAdminListingDetails = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await getAdminListingByIdService(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateAdminListingStatus = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { status } = req.body; 

    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const updatedListing = await updateListingStatusAdminService(listingId, status);

    if (!updatedListing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    let notifTitle = "";
    let notifMessage = "";

    if (status === "active") {
      notifTitle = "Listing Approved & Active!";
      notifMessage = `Great news! Your listing "${updatedListing.title}" is approved and live on Rentza.`;
    } else if (status === "inactive") {
      notifTitle = "Listing Suspended";
      notifMessage = `Notice: Your listing "${updatedListing.title}" has been suspended by an administrator. Please review our guidelines.`;
    }

    if (notifTitle) {
      await createNotificationService({
        recipientId: updatedListing.lenderId,
        type: "listing_status", 
        title: notifTitle,
        message: notifMessage,
        relatedListingId: updatedListing._id 
      });
    }

    res.status(200).json({
      success: true,
      message: `Listing status successfully updated to ${status}.`,
      data: updatedListing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteAdminListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    const deletedListing = await deleteListingService(listingId);

    if (!deletedListing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    await createNotificationService({
      recipientId: deletedListing.lenderId,
      type: "listing_status", 
      title: "Listing Removed",
      message: `Notice: Your listing "${deletedListing.title}" has been rejected or permanently removed by an administrator.`
    });

    res.status(200).json({
      success: true,
      message: "Listing permanently deleted.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateAdminListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const updateData = req.body; 

    const updatedListing = await updateListingService(listingId, updateData);

    if (!updatedListing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    await createNotificationService({
      recipientId: updatedListing.lenderId,
      type: "listing_update", 
      title: "Listing Updated by Admin",
      message: `An administrator has made edits to your listing "${updatedListing.title}". Please review the changes.`,
      relatedListingId: updatedListing._id
    });

    res.status(200).json({
      success: true,
      message: "Listing successfully updated.",
      data: updatedListing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAdminReports = async (req, res) => {
  try {
    
    const { status, search } = req.query; 

    const reports = await getAdminReportsService(status, search);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAdminReportDetails = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await getAdminReportByIdService(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateAdminReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body; 

    const updatedReport = await updateReportStatusService(reportId, status);
    if (!updatedReport) return res.status(404).json({ success: false, message: "Report not found." });

    if (status === "dismissed") {
      await createNotificationService({
        recipientId: updatedReport.reporterId._id,
        type: "report_update",
        title: "Report Reviewed",
        message: `Your report regarding "${updatedReport.reportedListingId.title}" has been reviewed. We found no violation and have dismissed the report. Thank you for keeping Rentza safe.`
      });
    }
    

    res.status(200).json({ success: true, message: `Report marked as ${status}.`, data: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const executeAdminReportAction = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { actionType } = req.body; 

    
    const resolvedReport = await updateReportStatusService(reportId, "resolved");
    if (!resolvedReport) return res.status(404).json({ success: false, message: "Report not found." });

    const listingTitle = resolvedReport.reportedListingId.title;
    const reporterId = resolvedReport.reporterId._id;
    const ownerId = resolvedReport.reportedUserId._id;

    
    if (actionType === "delete_listing") {
  
      await deleteListingService(resolvedReport.reportedListingId._id);


      await createNotificationService({
        recipientId: ownerId,
        type: "report_update",
        title: "Listing Removed",
        message: `Notice: Your listing "${listingTitle}" has been removed by an admin due to community reports indicating a policy violation.`
      });

    } else if (actionType === "suspend_owner") {
      
      await User.findByIdAndUpdate(ownerId, { isActive: false });

      
      await createNotificationService({
        recipientId: ownerId,
        type: "report_update",
        title: "Account Suspended",
        message: `Urgent Notice: Your account has been suspended due to multiple severe community reports regarding your listing "${listingTitle}".`
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action type." });
    }


    await createNotificationService({
      recipientId: reporterId,
      type: "report_update",
      title: "Action Taken on Report",
      message: `Your report regarding "${listingTitle}" has been reviewed by Admin and necessary action has been taken. Thank you.`
    });

    res.status(200).json({ success: true, message: `Action '${actionType}' executed successfully. Report resolved.`, data: resolvedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteAdminReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const deletedReport = await deleteReportService(reportId);

    if (!deletedReport) return res.status(404).json({ success: false, message: "Report not found." });

    res.status(200).json({ success: true, message: "Report permanently deleted from the database." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAnalyticsData = async (req, res) => {
  try {
    const listingsGrowth = await getListingsGrowthService();

    res.status(200).json({
      success: true,
      data: listingsGrowth
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getUserGrowthData = async (req, res) => {
  try {
    const usersGrowth = await getUserGrowthService();

    res.status(200).json({
      success: true,
      data: usersGrowth
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { isActive, search } = req.query; 

    const users = await getAdminUsersService(isActive, search);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAdminUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getAdminUserDetailsService(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAdminUserListings = async (req, res) => {
  try {
    const userId = req.params.id;
    const listings = await getAdminUserListingsService(userId);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateAdminUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body; 

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: "isActive must be a boolean." });
    }

    const updatedUser = await updateUserStatusService(userId, isActive);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    
    let notifTitle = isActive ? "Account Reinstated" : "Account Suspended";
    let notifMessage = isActive 
      ? "Great news! Your account has been reinstated by an administrator. You can now resume full activity on Rentza."
      : "Notice: Your account has been suspended by an administrator due to policy violations. Please contact support.";

    await createNotificationService({
      recipientId: updatedUser._id,
      type: "account_update", 
      title: notifTitle,
      message: notifMessage
    });

    res.status(200).json({
      success: true,
      message: `User successfully ${isActive ? 'unsuspended' : 'suspended'}.`,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteAdminUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await deleteUserService(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }


    res.status(200).json({
      success: true,
      message: "User permanently deleted from the database."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};