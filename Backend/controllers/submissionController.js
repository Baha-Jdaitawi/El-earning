import {
  createSubmission,
  getSubmissionById,
  getSubmissionByAssignmentAndStudent,
  getSubmissionsByAssignment,
  getSubmissionsByStudent,
  gradeSubmission,
  updateSubmission,
  getPendingSubmissions,
  getGradedSubmissionsByInstructor,
  bulkGradeSubmissions,
} from '../models/submissionModel.js';
import { getAssignmentById } from '../models/assignmentModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, content, file_path } = req.body;
    const user_id = req.user.id;

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'Assignment ID is required' });
    }

    const assignment = await getAssignmentById(parseInt(assignment_id));
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const enrolled = await isEnrolled(user_id, assignment.course_id);
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to submit' });

    const existing = await getSubmissionByAssignmentAndStudent(parseInt(assignment_id), user_id);
    if (existing) return res.status(409).json({ success: false, message: 'You already submitted this assignment' });

    const submission = await createSubmission({ assignment_id: parseInt(assignment_id), student_id: user_id, content, file_path });
    res.status(201).json({ success: true, message: 'Assignment submitted', data: submission });
  } catch (err) {
    if (err.message.includes('Late submissions are not allowed')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubmissionHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content, file_path } = req.body;

    const submission = await getSubmissionById(id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    if (submission.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (submission.grade !== null) {
      return res.status(400).json({ success: false, message: 'Cannot update a graded submission' });
    }

    const updated = await updateSubmission(id, { content, file_path });
    res.json({ success: true, message: 'Submission updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const submission = await getSubmissionById(parseInt(req.params.id));
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    if (req.user.role === 'student' && submission.student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubmissionsByAssignmentHandler = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { page = 1, limit = 10, graded } = req.query;

    const assignment = await getAssignmentById(parseInt(assignment_id));
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role !== 'admin' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { submissions, total } = await getSubmissionsByAssignment(parseInt(assignment_id), {
      page: parseInt(page),
      limit: parseInt(limit),
      graded: graded !== undefined ? graded === 'true' : undefined,
    });

    res.json({
      success: true,
      data: submissions,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, course_id } = req.query;
    const submissions = await getSubmissionsByStudent(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      course_id: course_id ? parseInt(course_id) : undefined,
    });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const gradeSubmissionHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ success: false, message: 'Grade is required' });
    }

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ success: false, message: 'Grade must be between 0 and 100' });
    }

    const submission = await getSubmissionById(id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const assignment = await getAssignmentById(submission.assignment_id);
    if (req.user.role !== 'admin' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const graded = await gradeSubmission(id, { grade, feedback }, req.user.id);
    res.json({ success: true, message: 'Submission graded', data: graded });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingSubmissionsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, course_id } = req.query;
    const submissions = await getPendingSubmissions(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      course_id: course_id ? parseInt(course_id) : undefined,
    });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGradedSubmissionsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const submissions = await getGradedSubmissionsByInstructor(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkGradeHandler = async (req, res) => {
  try {
    const { grades } = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: 'Grades array is required' });
    }

    const results = await bulkGradeSubmissions(grades, req.user.id);
    res.json({ success: true, message: `${results.length} submissions graded`, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};