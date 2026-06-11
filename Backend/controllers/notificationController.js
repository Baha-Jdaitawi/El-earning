import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../models/notificationModel.js';

export const getNotificationsHandler = async (req, res) => {
  try {
    const notifications = await getNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCountHandler = async (req, res) => {
  try {
    const count = await getUnreadNotificationsCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsReadHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await markNotificationAsRead(id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllAsReadHandler = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotificationHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteNotification(id, req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};