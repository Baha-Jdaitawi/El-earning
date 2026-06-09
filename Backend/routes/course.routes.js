import express from 'express';
import {
  getCourses,
  getCourse,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  getInstructorCourses,
  getFeatured,
  togglePublish,
} from '../controllers/courseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/featured', getFeatured);
router.get('/instructor/:instructorId', authenticate, getInstructorCourses);
router.get('/my', authenticate, authorize('instructor'), getInstructorCourses);
router.get('/:id', authenticate, getCourse);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourseHandler);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourseHandler);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourseHandler);
router.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), togglePublish);

export default router;