import {
  createAnnouncement,
  getAnnouncementsByCourse,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../models/announcementModel.js';
import { getCourseById } from '../models/courseModel.js';
import { sendNotification } from '../server.js';
import { query } from '../config/db.js';

export const createAnnouncementHandler = async (req, res) => {
  try {
    const { course_id, title, content } = req.body;

    if (!course_id || !title || !content) {
      return res.status(400).json({ success: false, message: 'Course ID, title and content are required' });
    }

    const course = await getCourseById(parseInt(course_id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const announcement = await createAnnouncement({
      course_id: parseInt(course_id),
      instructor_id: req.user.id,
      title,
      content,
    });

    // Notify all enrolled students
    const enrollments = await query(
      'SELECT user_id FROM enrollments WHERE course_id = $1',
      [parseInt(course_id)]
    );

    await Promise.all(enrollments.rows.map((e) =>
      sendNotification(e.user_id, {
        type: 'announcement',
        title: `New Announcement: ${title}`,
        message: `${course.title}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`,
        link: `/courses/${course_id}`,
      })
    ));

    res.status(201).json({ success: true, message: 'Announcement created', data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnnouncementsHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const announcements = await getAnnouncementsByCourse(parseInt(course_id));
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAnnouncementHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;

    const announcement = await getAnnouncementById(id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

    if (req.user.role !== 'admin' && announcement.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await updateAnnouncement(id, { title, content });
    res.json({ success: true, message: 'Announcement updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAnnouncementHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const announcement = await getAnnouncementById(id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

    if (req.user.role !== 'admin' && announcement.instructor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteAnnouncement(id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};