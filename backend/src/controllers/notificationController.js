import { getUserNotificationsService } from "../services/notificationService.js";
import { markAsReadService } from "../services/notificationService.js";
import { markAllAsReadService } from "../services/notificationService.js";

export const getMyNotifications = async (req, res) => {
  try {
    // Note: Make sure req.user._id matches how your auth middleware stores the user!
    // Sometimes it is req.userId depending on how you wrote your token verifier.
    const userId = req.user._id; 
    
    const notifications = await getUserNotificationsService(userId);

    const unreadCount = notifications.filter(n => n.isRead === false).length;

    res.status(200).json({
      success: true,
      unreadCount: unreadCount,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params; 
    
    const updatedNotification = await markAsReadService(id);
    
    if (!updatedNotification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updatedNotification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await markAllAsReadService(userId);
    
    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};