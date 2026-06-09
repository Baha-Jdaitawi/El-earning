import {
  createQuiz,
  getQuizById,
  getQuizzesByLesson,
  getQuizQuestionsForStudent,
  updateQuiz,
  deleteQuiz,
  submitQuizAnswers,
  bulkCreateQuizzes,
} from '../models/quizModel.js';
import { getLessonById } from '../models/lessonModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const getQuizzes = async (req, res) => {
  try {
    const { lesson_id } = req.params;

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role === 'student') {
      const enrolled = await isEnrolled(req.user.id, lesson.course_id);
      if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to access quizzes' });
      const quizzes = await getQuizQuestionsForStudent(parseInt(lesson_id));
      return res.json({ success: true, data: quizzes });
    }

    if (req.user.role === 'instructor' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const quizzes = await getQuizzesByLesson(parseInt(lesson_id));
    res.json({ success: true, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await getQuizById(parseInt(req.params.id));
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (req.user.role !== 'admin' && quiz.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuizHandler = async (req, res) => {
  try {
    const { lesson_id, question, answer, options, quiz_type, points } = req.body;

    if (!lesson_id || !question || !answer) {
      return res.status(400).json({ success: false, message: 'Lesson ID, question and answer are required' });
    }

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role !== 'admin' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (quiz_type === 'multiple_choice' && (!options || !Array.isArray(options))) {
      return res.status(400).json({ success: false, message: 'Options are required for multiple choice quizzes' });
    }

    const quiz = await createQuiz({
      lesson_id: parseInt(lesson_id),
      question: question.trim(),
      answer: answer.trim(),
      options,
      quiz_type: quiz_type || 'text',
      points: parseInt(points) || 1,
    });

    res.status(201).json({ success: true, message: 'Quiz created', data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateQuizHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quiz = await getQuizById(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (req.user.role !== 'admin' && quiz.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { question, answer, options, quiz_type, points } = req.body;
    const updates = {};

    if (question) updates.question = question.trim();
    if (answer) updates.answer = answer.trim();
    if (quiz_type) updates.quiz_type = quiz_type;
    if (options !== undefined) updates.options = JSON.stringify(options);
    if (points) updates.points = parseInt(points);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateQuiz(id, updates);
    res.json({ success: true, message: 'Quiz updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteQuizHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quiz = await getQuizById(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (req.user.role !== 'admin' && quiz.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteQuiz(id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Answers object is required' });
    }

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const enrolled = await isEnrolled(req.user.id, lesson.course_id);
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to submit quizzes' });

    const results = await submitQuizAnswers(parseInt(lesson_id), answers);
    res.json({ success: true, message: 'Quiz submitted', data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkCreateQuizzesHandler = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { quizzes } = req.body;

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return res.status(400).json({ success: false, message: 'Quizzes array is required' });
    }

    const lesson = await getLessonById(parseInt(lesson_id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role !== 'admin' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const created = await bulkCreateQuizzes(parseInt(lesson_id), quizzes);
    res.status(201).json({ success: true, message: `${created.length} quizzes created`, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};