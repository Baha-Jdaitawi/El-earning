import api from '../../../lib/axios.js';

export const getQuizzesApi = (lesson_id) => api.get(`/quizzes/lesson/${lesson_id}`);
export const getQuizApi = (id) => api.get(`/quizzes/${id}`);
export const createQuizApi = (data) => api.post('/quizzes', data);
export const updateQuizApi = (id, data) => api.put(`/quizzes/${id}`, data);
export const deleteQuizApi = (id) => api.delete(`/quizzes/${id}`);
export const submitQuizApi = (lesson_id, answers) => api.post(`/quizzes/lesson/${lesson_id}/submit`, { answers });
export const bulkCreateQuizzesApi = (lesson_id, quizzes) => api.post(`/quizzes/lesson/${lesson_id}/bulk`, { quizzes });