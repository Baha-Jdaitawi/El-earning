import {
  markLessonComplete,
  getLessonProgress,
  getCourseProgress,
  getUserCourseProgressDetail,
  getUserLearningStats,
  getRecentActivity,
} from '../models/progressModel.js';
import { getLessonById } from '../models/lessonModel.js';
import { isEnrolled, updateEnrollmentProgress } from '../models/enrollmentModel.js';

export const completeLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { time_spent } = req.body;
    const user_id = req.user.id;

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const enrolled = await isEnrolled(user_id, lesson.course_id);
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled in this course' });

    const progress = await markLessonComplete(user_id, parseInt(lesson_id), time_spent || 0);

    const courseProgress = await getCourseProgress(user_id, lesson.course_id);
    await updateEnrollmentProgress(user_id, lesson.course_id, courseProgress.percentage);

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: {
        lesson_progress: progress,
        course_progress: courseProgress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLessonProgressHandler = async (req, res) => {
  try {
    const { lesson_id } = req.params;

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const enrolled = await isEnrolled(req.user.id, lesson.course_id);
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled in this course' });

    const progress = await getLessonProgress(req.user.id, parseInt(lesson_id));
    res.json({ success: true, data: progress || { completed: false, time_spent: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseProgressHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user_id = req.user.id;

    const enrolled = await isEnrolled(user_id, parseInt(course_id));
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled in this course' });

    const progress = await getCourseProgress(user_id, parseInt(course_id));
    const detail = await getUserCourseProgressDetail(user_id, parseInt(course_id));

    res.json({
      success: true,
      data: {
        ...progress,
        lessons: detail,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLearningStats = async (req, res) => {
  try {
    const stats = await getUserLearningStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecentActivityHandler = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await getRecentActivity(req.user.id, parseInt(limit));
    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};