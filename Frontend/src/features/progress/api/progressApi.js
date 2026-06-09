import api from '../../../lib/axios.js';

export const completeLessonApi = (lesson_id, time_spent = 0) => api.post(`/progress/lesson/${lesson_id}/complete`, { time_spent });
export const getLessonProgressApi = (lesson_id) => api.get(`/progress/lesson/${lesson_id}`);
export const getCourseProgressApi = (course_id) => api.get(`/progress/course/${course_id}`);
export const getLearningStatsApi = () => api.get('/progress/stats');
export const getRecentActivityApi = (limit = 10) => api.get('/progress/activity', { params: { limit } });