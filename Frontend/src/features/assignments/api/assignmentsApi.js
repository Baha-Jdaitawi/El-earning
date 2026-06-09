import api from '../../../lib/axios.js';

export const getAssignmentsByLessonApi = (lesson_id) => api.get(`/assignments/lesson/${lesson_id}`);
export const getAssignmentsByCourseApi = (course_id) => api.get(`/assignments/course/${course_id}`);
export const getAssignmentApi = (id) => api.get(`/assignments/${id}`);
export const getUpcomingAssignmentsApi = (limit) => api.get('/assignments/upcoming', { params: { limit } });
export const createAssignmentApi = (data) => api.post('/assignments', data);
export const updateAssignmentApi = (id, data) => api.put(`/assignments/${id}`, data);
export const deleteAssignmentApi = (id) => api.delete(`/assignments/${id}`);

export const submitAssignmentApi = (data) => api.post('/submissions', data);
export const updateSubmissionApi = (id, data) => api.put(`/submissions/${id}`, data);
export const getMySubmissionsApi = (params) => api.get('/submissions/my', { params });
export const getSubmissionApi = (id) => api.get(`/submissions/${id}`);
export const gradeSubmissionApi = (id, data) => api.patch(`/submissions/${id}/grade`, data);
export const getPendingSubmissionsApi = (params) => api.get('/submissions/pending', { params });
export const getGradedSubmissionsApi = () => api.get('/submissions/graded');
export const bulkGradeApi = (grades) => api.patch('/submissions/bulk-grade', { grades });