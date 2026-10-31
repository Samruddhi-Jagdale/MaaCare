// controllers/notificationController.js
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  broadcastAnnouncement,
} = require('../services/notificationService');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private (All authenticated users)
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const data = await getUserNotifications(req.user._id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    unreadOnly: unreadOnly === 'true',
  });
  res.json(data);
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private (All authenticated users)
const getMyUnreadCount = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.json({ unreadCount: count });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid notification ID format');
  }

  const notification = await markNotificationRead(req.params.id, req.user._id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or access denied');
  }
  res.json(notification);
});

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsRead(req.user._id);
  res.json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
});

// @desc    Broadcast administrative announcement
// @route   POST /api/notifications/broadcast
// @access  Private (Admin only)
const createBroadcastAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, targetRole } = req.body;
  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required for announcement');
  }

  const result = await broadcastAnnouncement({
    title: title.trim(),
    message: message.trim(),
    senderId: req.user._id,
    targetRole: targetRole || 'all',
  });

  res.status(201).json({
    message: `Announcement successfully dispatched to ${result.dispatchedCount} users`,
    dispatchedCount: result.dispatchedCount,
  });
});

module.exports = {
  getMyNotifications,
  getMyUnreadCount,
  markAsRead,
  markAllAsRead,
  createBroadcastAnnouncement,
};
