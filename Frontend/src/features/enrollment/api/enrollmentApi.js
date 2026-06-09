import api from '../../../lib/axios.js';

export const enrollApi = (course_id) => api.post('/enrollments', { course_id });
export const unenrollApi = (course_id) => api.delete(`/enrollments/course/${course_id}`);
export const getMyEnrollmentsApi = (params) => api.get('/enrollments/my', { params });
export const getEnrollmentStatusApi = (course_id) => api.get(`/enrollments/course/${course_id}/status`);
export const getCourseStudentsApi = (course_id, params) => api.get(`/enrollments/course/${course_id}/students`, { params });