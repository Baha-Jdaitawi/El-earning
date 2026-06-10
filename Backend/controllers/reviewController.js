import {
  createReview,
  getReviewByCourseAndStudent,
  getReviewsByCourse,
  getCourseRatingStats,
  updateReview,
  deleteReview,
} from '../models/reviewModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const createReviewHandler = async (req, res) => {
  try {
    const { course_id, rating, comment } = req.body;
    const student_id = req.user.id;

    if (!course_id || !rating) {
      return res.status(400).json({ success: false, message: 'Course ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const enrolled = await isEnrolled(student_id, parseInt(course_id));
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled to review this course' });
    }

    const existing = await getReviewByCourseAndStudent(parseInt(course_id), student_id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this course' });
    }

    const review = await createReview({
      course_id: parseInt(course_id),
      student_id,
      rating: parseInt(rating),
      comment,
    });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReviewsHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const { reviews, total } = await getReviewsByCourse(parseInt(course_id), {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const stats = await getCourseRatingStats(parseInt(course_id));

    res.json({
      success: true,
      data: reviews,
      stats,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyReviewHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const review = await getReviewByCourseAndStudent(parseInt(course_id), req.user.id);
    res.json({ success: true, data: review || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateReviewHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const updated = await updateReview(id, { rating: parseInt(rating), comment });
    if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });

    res.json({ success: true, message: 'Review updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReviewHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteReview(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};