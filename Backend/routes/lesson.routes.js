import express from 'express';
import {
  getLessons,
  getLesson,
  createLessonHandler,
  updateLessonHandler,
  deleteLessonHandler,
  reorderLessonsHandler,
} from '../controllers/lessonController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/module/:module_id', authenticate, getLessons);
router.get('/:id', authenticate, getLesson);
router.post('/', authenticate, authorize('instructor', 'admin'), createLessonHandler);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateLessonHandler);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteLessonHandler);
router.patch('/module/:module_id/reorder', authenticate, authorize('instructor', 'admin'), reorderLessonsHandler);

export default router;