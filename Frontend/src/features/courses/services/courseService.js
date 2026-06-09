import {
  getCoursesApi,
  getCourseApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  getFeaturedCoursesApi,
  getInstructorCoursesApi,
  togglePublishApi,
} from '../api/coursesApi.js';

export const getCoursesService = async (params) => {
  const res = await getCoursesApi(params);
  return res.data;
};

export const getCourseService = async (id) => {
  const res = await getCourseApi(id);
  return res.data.data;
};

export const createCourseService = async (data) => {
  const res = await createCourseApi(data);
  return res.data.data;
};

export const updateCourseService = async (id, data) => {
  const res = await updateCourseApi(id, data);
  return res.data.data;
};

export const deleteCourseService = async (id) => {
  await deleteCourseApi(id);
  return id;
};

export const getFeaturedCoursesService = async () => {
  const res = await getFeaturedCoursesApi();
  return res.data.data;
};

export const getInstructorCoursesService = async () => {
  const res = await getInstructorCoursesApi();
  return res.data.data;
};

export const togglePublishService = async (id) => {
  const res = await togglePublishApi(id);
  return res.data.data;
};