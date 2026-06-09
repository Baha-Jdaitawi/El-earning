import {
  getModulesApi,
  getModuleWithLessonsApi,
  getLessonsApi,
  getLessonApi,
  createLessonApi,
  updateLessonApi,
  deleteLessonApi,
  reorderLessonsApi,
} from '../api/lessonsApi.js';

export const getModulesService = async (course_id) => {
  const res = await getModulesApi(course_id);
  return res.data.data;
};

export const getModuleWithLessonsService = async (module_id) => {
  const res = await getModuleWithLessonsApi(module_id);
  return res.data.data;
};

export const getLessonsService = async (module_id) => {
  const res = await getLessonsApi(module_id);
  return res.data.data;
};

export const getLessonService = async (id) => {
  const res = await getLessonApi(id);
  return res.data.data;
};

export const createLessonService = async (data) => {
  const res = await createLessonApi(data);
  return res.data.data;
};

export const updateLessonService = async (id, data) => {
  const res = await updateLessonApi(id, data);
  return res.data.data;
};

export const deleteLessonService = async (id) => {
  await deleteLessonApi(id);
  return id;
};

export const reorderLessonsService = async (module_id, positions) => {
  const res = await reorderLessonsApi(module_id, positions);
  return res.data;
};