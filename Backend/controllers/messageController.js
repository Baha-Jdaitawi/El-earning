import {
  getCourseMessages,
  getDirectMessages,
  markDirectMessagesAsRead,
  getUnreadCount,
  getDirectMessageContacts,
  deleteMessage,
  clearCourseChat,
} from '../models/messageModel.js';
import { isEnrolled } from '../models/enrollmentModel.js';

export const getCourseMessagesHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user = req.user;

    if (user.role === 'student') {
      const enrolled = await isEnrolled(user.id, parseInt(course_id));
      if (!enrolled) {
        return res.status(403).json({ success: false, message: 'You must be enrolled to access course chat' });
      }
    }

    const messages = await getCourseMessages(parseInt(course_id));
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDirectMessagesHandler = async (req, res) => {
  try {
    const { user_id } = req.params;
    const messages = await getDirectMessages(req.user.id, parseInt(user_id));
    await markDirectMessagesAsRead(parseInt(user_id), req.user.id);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getContactsHandler = async (req, res) => {
  try {
    const contacts = await getDirectMessageContacts(req.user.id);
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCountHandler = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMessageHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteMessage(id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearCourseChatHandler = async (req, res) => {
  try {
    const { course_id } = req.params;
    await clearCourseChat(parseInt(course_id));
    res.json({ success: true, message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};