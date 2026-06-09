import {
  createEnrollment,
  getEnrollmentByUserAndCourse,
  getUserEnrollments,
  getCourseEnrollments,
  updateEnrollmentProgress,
  deleteEnrollment,
  isEnrolled,
} from '../models/enrollmentModel.js';
import { getCourseById } from '../models/courseModel.js';
import { getCourseProgress } from '../models/progressModel.js';

export const enroll = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    if (!course_id) return res.status(400).json({ success: false, message: 'Course ID is required' });

    const course = await getCourseById(parseInt(course_id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (!course.is_published) return res.status(400).json({ success: false, message: 'Course is not published' });

    const already = await isEnrolled(user_id, parseInt(course_id));
    if (already) return res.status(409).json({ success: false, message: 'Already enrolled in this course' });

    const enrollment = await createEnrollment(user_id, parseInt(course_id));
    res.status(201).json({ success: true, message: 'Enrolled successfully', data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unenroll = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user_id = req.user.id;

    const enrollment = await getEnrollmentByUserAndCourse(user_id, parseInt(course_id));
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    await deleteEnrollment(user_id, parseInt(course_id));
    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, completed } = req.query;
    const { enrollments, total } = await getUserEnrollments(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      completed: completed !== undefined ? completed === 'true' : undefined,
    });

    res.json({
      success: true,
      data: enrollments,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseStudents = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const course = await getCourseById(parseInt(course_id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { enrollments, total } = await getCourseEnrollments(parseInt(course_id), {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: enrollments,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEnrollmentStatus = async (req, res) => {
  try {
    const { course_id } = req.params;
    const enrollment = await getEnrollmentByUserAndCourse(req.user.id, parseInt(course_id));

    if (!enrollment) {
      return res.json({ success: true, data: { enrolled: false } });
    }

    const progress = await getCourseProgress(req.user.id, parseInt(course_id));

    res.json({
      success: true,
      data: {
        enrolled: true,
        progress: progress.percentage,
        completed: enrollment.completed,
        enrolled_at: enrollment.enrolled_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};