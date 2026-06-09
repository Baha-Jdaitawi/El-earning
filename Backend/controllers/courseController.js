import {
  createCourse,
  getCourseById,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  getFeaturedCourses,
  courseTitleExistsForInstructor,
} from '../models/courseModel.js';
import { getCategoryById } from '../models/categoryModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, level, search, instructor_id, is_published } = req.query;
    const { courses, total } = await getAllCourses({
      page: parseInt(page),
      limit: parseInt(limit),
      category_id: category_id ? parseInt(category_id) : null,
      level,
      search,
      instructor_id: instructor_id ? parseInt(instructor_id) : null,
      is_published: is_published !== undefined ? is_published === 'true' : null,
    });

    res.json({
      success: true,
      data: courses,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourse = async (req, res) => {
  try {
    const course = await getCourseById(parseInt(req.params.id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let enrolled = false;
    if (req.user?.role === 'student') {
      enrolled = await isEnrolled(req.user.id, course.id);
    }

    res.json({ success: true, data: { ...course, enrolled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCourseHandler = async (req, res) => {
  try {
    const { title, description, category_id, level, duration_weeks, is_published, price } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).json({ success: false, message: 'Title, description and category are required' });
    }

    const category = await getCategoryById(parseInt(category_id));
    if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });

    const taken = await courseTitleExistsForInstructor(req.user.id, title);
    if (taken) return res.status(409).json({ success: false, message: 'You already have a course with this title' });

    const course = await createCourse({
      title: title.trim(),
      description: description.trim(),
      category_id: parseInt(category_id),
      instructor_id: req.user.id,
      price: parseFloat(price) || 0,
      level: level || 'beginner',
      duration_weeks: parseInt(duration_weeks) || 1,
      is_published: is_published || false,
    });

    res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCourseHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await getCourseById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, description, category_id, level, duration_weeks, is_published, price } = req.body;
    const updates = {};

    if (title) {
      const taken = await courseTitleExistsForInstructor(course.instructor_id, title, id);
      if (taken) return res.status(409).json({ success: false, message: 'You already have a course with this title' });
      updates.title = title.trim();
    }
    if (description) updates.description = description.trim();
    if (category_id) {
      const category = await getCategoryById(parseInt(category_id));
      if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
      updates.category_id = parseInt(category_id);
    }
    if (level) updates.level = level;
    if (duration_weeks) updates.duration_weeks = parseInt(duration_weeks);
    if (price !== undefined) updates.price = parseFloat(price) || 0;
    if (is_published !== undefined) updates.is_published = is_published;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateCourse(id, updates);
    res.json({ success: true, message: 'Course updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCourseHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await getCourseById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteCourse(id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.params.instructorId ? parseInt(req.params.instructorId) : req.user.id;
    const courses = await getCoursesByInstructor(instructorId);
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const courses = await getFeaturedCourses(parseInt(req.query.limit) || 6);
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await getCourseById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await updateCourse(id, { is_published: !course.is_published });
    res.json({ success: true, message: `Course ${updated.is_published ? 'published' : 'unpublished'}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};