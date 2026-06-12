import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import courseRoutes from './course.routes.js';
import moduleRoutes from './module.routes.js';
import lessonRoutes from './lesson.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import progressRoutes from './progress.routes.js';
import quizRoutes from './quiz.routes.js';
import assignmentRoutes from './assignment.routes.js';
import submissionRoutes from './submission.routes.js';
import reviewRoutes from './review.routes.js';
import messageRoutes from './message.routes.js';
import notificationRoutes from './notification.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import announcementRoutes from './announcement.routes.js';
import aiRoutes from './ai.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/announcements', announcementRoutes);
router.use('/ai', aiRoutes);


export default router;