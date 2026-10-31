// services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({
  recipient,
  sender,
  title,
  message,
  type = 'general',
  referenceId,
  referenceModel,
}) => {
  if (!recipient || !title || !message) {
    throw new Error('Recipient, title, and message are required for notification');
  }

  return await Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    referenceId,
    referenceModel,
  });
};

const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const query = { recipient: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name role'),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notification) {
    return null;
  }
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return result;
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, isRead: false });
};

// Admin broadcast announcement to all users or specific roles
const broadcastAnnouncement = async ({ title, message, senderId, targetRole = 'all' }) => {
  const filter = { isActive: { $ne: false } };
  if (targetRole && targetRole !== 'all') {
    filter.role = targetRole;
  }

  const users = await User.find(filter).select('_id');
  const notifDocs = users.map((u) => ({
    recipient: u._id,
    sender: senderId,
    title,
    message,
    type: 'admin_announcement',
    isRead: false,
  }));

  if (notifDocs.length > 0) {
    await Notification.insertMany(notifDocs);
  }

  return { dispatchedCount: notifDocs.length };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  broadcastAnnouncement,
};
