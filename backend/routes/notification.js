// routes/notification.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  getMyUnreadCount,
  markAsRead,
  markAllAsRead,
  createBroadcastAnnouncement,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getMyUnreadCount);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/broadcast', authorize('admin'), createBroadcastAnnouncement);

module.exports = router;
