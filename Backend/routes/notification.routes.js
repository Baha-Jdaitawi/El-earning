import express from 'express';
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotificationsHandler);
router.get('/unread', getUnreadCountHandler);
router.patch('/:id/read', markAsReadHandler);
router.patch('/read-all', markAllAsReadHandler);
router.delete('/:id', deleteNotificationHandler);

export default router;