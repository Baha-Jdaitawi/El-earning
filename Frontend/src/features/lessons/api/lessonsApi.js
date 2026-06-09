import api from '../../../lib/axios.js';

export const getModulesApi = (course_id) => api.get(`/modules/course/${course_id}`);
export const getLessonsApi = (module_id) => api.get(`/lessons/module/${module_id}`);
export const getLessonApi = (id) => api.get(`/lessons/${id}`);
export const createLessonApi = (data) => api.post('/lessons', data);
export const updateLessonApi = (id, data) => api.put(`/lessons/${id}`, data);
export const deleteLessonApi = (id) => api.delete(`/lessons/${id}`);
export const reorderLessonsApi = (module_id, positions) => api.patch(`/lessons/module/${module_id}/reorder`, { positions });