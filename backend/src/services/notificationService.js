import Notification from "../models/notification.js";

// Helper 1: For the Admin/System to create alerts 
export const createNotificationService = async (data) => {
  const newNotification = new Notification(data);
  return await newNotification.save();
};

// Helper 2: For the User to get their alerts (Newest first)
export const getUserNotificationsService = async (userId) => {
  return await Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
};

// Helper 3: For the User to mark an alert as read
export const markAsReadService = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId, 
    { isRead: true }, 
    { new: true } 
  );
};

// Helper 4: Mark ALL unread notifications as read for a specific user
export const markAllAsReadService = async (userId) => {
  return await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { isRead: true }
  );
};