import express from 'express';
import {
  completeLesson,
  getLessonProgressHandler,
  getCourseProgressHandler,
  getLearningStats,
  getRecentActivityHandler,
} from '../controllers/progressController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/lesson/:lesson_id/complete', authorize('student'), completeLesson);
router.get('/lesson/:lesson_id', authorize('student'), getLessonProgressHandler);
router.get('/course/:course_id', authorize('student'), getCourseProgressHandler);
router.get('/stats', authorize('student'), getLearningStats);
router.get('/activity', authorize('student'), getRecentActivityHandler);

export default router;