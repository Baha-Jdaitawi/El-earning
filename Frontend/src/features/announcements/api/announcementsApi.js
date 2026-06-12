import api from '../../../lib/axios.js';

export const getAnnouncementsApi = (course_id) => api.get(`/announcements/course/${course_id}`);
export const createAnnouncementApi = (data) => api.post('/announcements', data);
export const updateAnnouncementApi = (id, data) => api.put(`/announcements/${id}`, data);
export const deleteAnnouncementApi = (id) => api.delete(`/announcements/${id}`);