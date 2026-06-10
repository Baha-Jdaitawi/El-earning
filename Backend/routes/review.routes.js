import express from 'express';
import {
  createReviewHandler,
  getReviewsHandler,
  getMyReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/course/:course_id', getReviewsHandler);
router.get('/course/:course_id/my', authenticate, authorize('student'), getMyReviewHandler);
router.post('/', authenticate, authorize('student'), createReviewHandler);
router.put('/:id', authenticate, authorize('student'), updateReviewHandler);
router.delete('/:id', authenticate, authorize('student', 'admin'), deleteReviewHandler);

export default router;