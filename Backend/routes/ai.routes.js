import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  generateQuizHandler,
  courseAssistantHandler,
  assignmentFeedbackHandler,
} from '../controllers/aiController.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate-quiz', authorize('instructor', 'admin'), generateQuizHandler);
router.post('/course-assistant', courseAssistantHandler);
router.post('/assignment-feedback', authorize('instructor', 'admin'), assignmentFeedbackHandler);

export default router;