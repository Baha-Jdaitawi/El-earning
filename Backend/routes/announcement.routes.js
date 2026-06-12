import express from 'express';
import {
  createAnnouncementHandler,
  getAnnouncementsHandler,
  updateAnnouncementHandler,
  deleteAnnouncementHandler,
} from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/course/:course_id', getAnnouncementsHandler);
router.post('/', authorize('instructor', 'admin'), createAnnouncementHandler);
router.put('/:id', authorize('instructor', 'admin'), updateAnnouncementHandler);
router.delete('/:id', authorize('instructor', 'admin'), deleteAnnouncementHandler);

export default router;