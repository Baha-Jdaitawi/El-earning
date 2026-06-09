import express from 'express';
import {
  submitAssignment,
  updateSubmissionHandler,
  getSubmission,
  getSubmissionsByAssignmentHandler,
  getMySubmissions,
  gradeSubmissionHandler,
  getPendingSubmissionsHandler,
  getGradedSubmissionsHandler,
  bulkGradeHandler,
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('student'), submitAssignment);
router.get('/my', authorize('student'), getMySubmissions);
router.get('/pending', authorize('instructor', 'admin'), getPendingSubmissionsHandler);
router.get('/graded', authorize('instructor', 'admin'), getGradedSubmissionsHandler);
router.get('/assignment/:assignment_id', authorize('instructor', 'admin'), getSubmissionsByAssignmentHandler);
router.get('/:id', getSubmission);
router.put('/:id', authorize('student'), updateSubmissionHandler);
router.patch('/:id/grade', authorize('instructor', 'admin'), gradeSubmissionHandler);
router.patch('/bulk-grade', authorize('instructor', 'admin'), bulkGradeHandler);

export default router;