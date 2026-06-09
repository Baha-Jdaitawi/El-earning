import {
  createAssignment,
  getAssignmentById,
  getAssignmentsByLesson,
  getAssignmentsByCourse,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
} from '../models/assignmentModel.js';
import { getLessonById } from '../models/lessonModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const getAssignmentsByLessonHandler = async (req, res) => {
  try {
    const { lesson_id } = req.params;

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role === 'student') {
      const enrolled = await isEnrolled(req.user.id, lesson.course_id);
      if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to view assignments' });
    }

    if (req.user.role === 'instructor' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const assignments = await getAssignmentsByLesson(parseInt(lesson_id));
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssignmentsByCourseHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const assignments = await getAssignmentsByCourse(parseInt(course_id));
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssignment = async (req, res) => {
  try {
    const assignment = await getAssignmentById(parseInt(req.params.id));
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role === 'student') {
      const enrolled = await isEnrolled(req.user.id, assignment.course_id);
      if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to view this assignment' });
    }

    if (req.user.role === 'instructor' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAssignmentHandler = async (req, res) => {
  try {
    const { lesson_id, title, description, due_date, max_points, allow_late_submission, late_penalty_percent } = req.body;

    if (!lesson_id || !title) {
      return res.status(400).json({ success: false, message: 'Lesson ID and title are required' });
    }

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role !== 'admin' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (due_date && new Date(due_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
    }

    const assignment = await createAssignment({
      lesson_id: parseInt(lesson_id),
      title: title.trim(),
      description,
      due_date,
      max_points: parseInt(max_points) || 100,
      allow_late_submission: allow_late_submission ?? true,
      late_penalty_percent: parseInt(late_penalty_percent) || 10,
    });

    res.status(201).json({ success: true, message: 'Assignment created', data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAssignmentHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const assignment = await getAssignmentById(id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role !== 'admin' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, description, due_date, max_points, allow_late_submission, late_penalty_percent } = req.body;
    const updates = {};

    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (due_date !== undefined) {
      if (due_date && new Date(due_date) < new Date()) {
        return res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
      }
      updates.due_date = due_date;
    }
    if (max_points) updates.max_points = parseInt(max_points);
    if (allow_late_submission !== undefined) updates.allow_late_submission = allow_late_submission;
    if (late_penalty_percent !== undefined) updates.late_penalty_percent = parseInt(late_penalty_percent);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateAssignment(id, updates);
    res.json({ success: true, message: 'Assignment updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAssignmentHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const assignment = await getAssignmentById(id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role !== 'admin' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteAssignment(id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    if (err.message.includes('has submissions')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUpcomingAssignmentsHandler = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const assignments = await getUpcomingAssignments(req.user.id, parseInt(limit));
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};