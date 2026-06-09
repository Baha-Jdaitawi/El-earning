import api from '../../../lib/axios.js';

export const getProgressStatsApi = () => api.get('/progress/stats');
export const getRecentActivityApi = (limit) => api.get('/progress/activity', { params: { limit } });
export const getLearningStatsApi = () => api.get('/progress/stats');
export const getInstructorCoursesApi = () => api.get('/courses/my');
export const getCourseStudentsApi = (course_id) => api.get(`/enrollments/course/${course_id}/students`);
export const getUsersApi = (params) => api.get('/users', { params });
export const getUserStatsApi = () => api.get('/users/stats');
export const getCategoriesApi = () => api.get('/categories');