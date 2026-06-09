import express from 'express';
import {
  enroll,
  unenroll,
  getMyEnrollments,
  getCourseStudents,
  getEnrollmentStatus,
} from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('student'), enroll);
router.delete('/course/:course_id', authorize('student'), unenroll);
router.get('/my', getMyEnrollments);
router.get('/course/:course_id/students', authorize('instructor', 'admin'), getCourseStudents);
router.get('/course/:course_id/status', authorize('student'), getEnrollmentStatus);

export default router;