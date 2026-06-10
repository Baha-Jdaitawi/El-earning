import api from '../../../lib/axios.js';

export const getReviewsApi = (course_id, params) => api.get(`/reviews/course/${course_id}`, { params });
export const getMyReviewApi = (course_id) => api.get(`/reviews/course/${course_id}/my`);
export const createReviewApi = (data) => api.post('/reviews', data);
export const updateReviewApi = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReviewApi = (id) => api.delete(`/reviews/${id}`);