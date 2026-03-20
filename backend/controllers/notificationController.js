const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return sendSuccess(res, 200, 'Notifications fetched', { notifications, unreadCount });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    return sendSuccess(res, 200, 'Notification marked as read');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Helper function to create notification (used by other controllers)
const createNotification = async (io, userId, data) => {
  try {
    const notification = await Notification.create({ userId, ...data });
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', { notification });
    }
    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
