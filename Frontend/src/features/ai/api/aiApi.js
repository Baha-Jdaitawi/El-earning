import api from '../../../lib/axios.js';

export const generateQuizApi = (data) => api.post('/ai/generate-quiz', data);
export const courseAssistantApi = (data) => api.post('/ai/course-assistant', data);
export const assignmentFeedbackApi = (data) => api.post('/ai/assignment-feedback', data);