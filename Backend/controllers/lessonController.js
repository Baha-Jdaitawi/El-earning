import {
  createLesson,
  getLessonById,
  getLessonsByModule,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getNextLessonPosition,
} from '../models/lessonModel.js';
import { getModuleById } from '../models/moduleModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const getLessons = async (req, res) => {
  try {
    const { module_id } = req.params;
    const includeUnpublished = req.user.role === 'admin' || req.user.role === 'instructor';
    const lessons = await getLessonsByModule(parseInt(module_id), includeUnpublished);
    res.json({ success: true, data: lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLesson = async (req, res) => {
  try {
    const lesson = await getLessonById(parseInt(req.params.id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role === 'student') {
      const enrolled = await isEnrolled(req.user.id, lesson.course_id);
      if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to access this lesson' });
    }

    if (req.user.role === 'instructor' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLessonHandler = async (req, res) => {
  try {
    const { module_id, title, content, video_url, video_duration, position, is_published } = req.body;

    if (!module_id || !title) {
      return res.status(400).json({ success: false, message: 'Module ID and title are required' });
    }

    const module = await getModuleById(parseInt(module_id));
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (req.user.role !== 'admin' && module.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const lessonPosition = position || await getNextLessonPosition(parseInt(module_id));

    const lesson = await createLesson({
      module_id: parseInt(module_id),
      title: title.trim(),
      content,
      video_url,
      video_duration: parseInt(video_duration) || 0,
      position: lessonPosition,
      is_published: is_published ?? true,
    });

    res.status(201).json({ success: true, message: 'Lesson created', data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateLessonHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lesson = await getLessonById(id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role !== 'admin' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, content, video_url, video_duration, position, is_published } = req.body;
    const updates = {};

    if (title) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (video_url !== undefined) updates.video_url = video_url;
    if (video_duration !== undefined) updates.video_duration = parseInt(video_duration) || 0;
    if (position) updates.position = position;
    if (is_published !== undefined) updates.is_published = is_published;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateLesson(id, updates);
    res.json({ success: true, message: 'Lesson updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteLessonHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lesson = await getLessonById(id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    if (req.user.role !== 'admin' && lesson.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteLesson(id);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reorderLessonsHandler = async (req, res) => {
  try {
    const { module_id } = req.params;
    const { positions } = req.body;

    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Positions array is required' });
    }

    const module = await getModuleById(parseInt(module_id));
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (req.user.role !== 'admin' && module.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await reorderLessons(parseInt(module_id), positions);
    res.json({ success: true, message: 'Lessons reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};