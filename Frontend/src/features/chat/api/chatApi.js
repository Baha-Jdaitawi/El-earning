import api from '../../../lib/axios.js';

export const getCourseMessagesApi = (course_id) => api.get(`/messages/course/${course_id}`);
export const getDirectMessagesApi = (user_id) => api.get(`/messages/direct/${user_id}`);
export const getContactsApi = () => api.get('/messages/contacts');
export const getUnreadCountApi = () => api.get('/messages/unread');
export const deleteMessageApi = (id) => api.delete(`/messages/${id}`);
export const clearCourseChatApi = (course_id) => api.delete(`/messages/course/${course_id}/clear`);