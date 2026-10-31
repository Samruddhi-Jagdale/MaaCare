// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: [
      'appointment_scheduled',
      'appointment_rescheduled',
      'appointment_reminder',
      'overdue_alert',
      'checkup_completed',
      'admin_announcement',
      'general',
    ],
    default: 'general',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  referenceModel: {
    type: String,
  },
}, { timestamps: true });

// Compound index for efficient user notifications query sorted by date
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
