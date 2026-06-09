import express from 'express';
import {
  getAssignment,
  getAssignmentsByLessonHandler,
  getAssignmentsByCourseHandler,
  createAssignmentHandler,
  updateAssignmentHandler,
  deleteAssignmentHandler,
  getUpcomingAssignmentsHandler,
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/upcoming', authorize('student'), getUpcomingAssignmentsHandler);
router.get('/lesson/:lesson_id', getAssignmentsByLessonHandler);
router.get('/course/:course_id', authorize('instructor', 'admin'), getAssignmentsByCourseHandler);
router.get('/:id', getAssignment);
router.post('/', authorize('instructor', 'admin'), createAssignmentHandler);
router.put('/:id', authorize('instructor', 'admin'), updateAssignmentHandler);
router.delete('/:id', authorize('instructor', 'admin'), deleteAssignmentHandler);

export default router;