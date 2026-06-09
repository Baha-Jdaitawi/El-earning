import {
  createModule,
  getModuleById,
  getModulesByCourse,
  updateModule,
  deleteModule,
  reorderModules,
  getNextModulePosition,
  moduleTitleExistsInCourse,
} from '../models/moduleModel.js';
import { getCourseById } from '../models/courseModel.js';

export const getModules = async (req, res) => {
  try {
    const { course_id } = req.params;
    const includeUnpublished = req.user.role === 'admin' || req.user.role === 'instructor';
    const modules = await getModulesByCourse(parseInt(course_id), includeUnpublished);
    res.json({ success: true, data: modules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getModule = async (req, res) => {
  try {
    const module = await getModuleById(parseInt(req.params.id));
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (req.user.role === 'instructor' && module.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: module });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createModuleHandler = async (req, res) => {
  try {
    const { course_id, title, description, position, is_published } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ success: false, message: 'Course ID and title are required' });
    }

    const course = await getCourseById(parseInt(course_id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const taken = await moduleTitleExistsInCourse(title, parseInt(course_id));
    if (taken) return res.status(409).json({ success: false, message: 'Module title already exists in this course' });

    const modulePosition = position || await getNextModulePosition(parseInt(course_id));

    const module = await createModule({
      course_id: parseInt(course_id),
      title: title.trim(),
      description,
      position: modulePosition,
      is_published: is_published ?? true,
    });

    res.status(201).json({ success: true, message: 'Module created', data: module });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateModuleHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const module = await getModuleById(id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (req.user.role !== 'admin' && module.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, description, position, is_published } = req.body;
    const updates = {};

    if (title) {
      const taken = await moduleTitleExistsInCourse(title, module.course_id, id);
      if (taken) return res.status(409).json({ success: false, message: 'Module title already exists in this course' });
      updates.title = title.trim();
    }
    if (description !== undefined) updates.description = description;
    if (position) updates.position = position;
    if (is_published !== undefined) updates.is_published = is_published;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updated = await updateModule(id, updates);
    res.json({ success: true, message: 'Module updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteModuleHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const module = await getModuleById(id);
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

    if (req.user.role !== 'admin' && module.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteModule(id);
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) {
    if (err.message.includes('has lessons')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reorderModulesHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { positions } = req.body;

    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Positions array is required' });
    }

    const course = await getCourseById(parseInt(course_id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await reorderModules(parseInt(course_id), positions);
    res.json({ success: true, message: 'Modules reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};