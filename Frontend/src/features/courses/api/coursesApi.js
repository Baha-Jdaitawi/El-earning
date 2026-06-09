import api from '../../../lib/axios.js';

export const getCoursesApi = (params) => api.get('/courses', { params });
export const getCourseApi = (id) => api.get(`/courses/${id}`);
export const createCourseApi = (data) => api.post('/courses', data);
export const updateCourseApi = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourseApi = (id) => api.delete(`/courses/${id}`);
export const getFeaturedCoursesApi = () => api.get('/courses/featured');
export const getInstructorCoursesApi = () => api.get('/courses/my');
export const togglePublishApi = (id) => api.patch(`/courses/${id}/publish`);