import express from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuizHandler,
  updateQuizHandler,
  deleteQuizHandler,
  submitQuiz,
  bulkCreateQuizzesHandler,
} from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/lesson/:lesson_id', getQuizzes);
router.get('/:id', authorize('instructor', 'admin'), getQuiz);
router.post('/', authorize('instructor', 'admin'), createQuizHandler);
router.put('/:id', authorize('instructor', 'admin'), updateQuizHandler);
router.delete('/:id', authorize('instructor', 'admin'), deleteQuizHandler);
router.post('/lesson/:lesson_id/submit', authorize('student'), submitQuiz);
router.post('/lesson/:lesson_id/bulk', authorize('instructor', 'admin'), bulkCreateQuizzesHandler);

export default router;