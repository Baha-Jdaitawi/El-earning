import express from 'express';
import {
  getCourseMessagesHandler,
  getDirectMessagesHandler,
  getContactsHandler,
  getUnreadCountHandler,
  deleteMessageHandler,
  clearCourseChatHandler,
} from '../controllers/messageController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/course/:course_id', getCourseMessagesHandler);
router.get('/direct/:user_id', getDirectMessagesHandler);
router.get('/contacts', getContactsHandler);
router.get('/unread', getUnreadCountHandler);
router.delete('/course/:course_id/clear', authorize('instructor', 'admin'), clearCourseChatHandler);
router.delete('/:id', deleteMessageHandler);

export default router;