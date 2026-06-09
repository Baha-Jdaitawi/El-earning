import {
  enrollApi,
  unenrollApi,
  getMyEnrollmentsApi,
  getEnrollmentStatusApi,
  getCourseStudentsApi,
} from '../api/enrollmentApi.js';

export const enrollService = async (course_id) => {
  const res = await enrollApi(course_id);
  return res.data.data;
};

export const unenrollService = async (course_id) => {
  await unenrollApi(course_id);
  return course_id;
};

export const getMyEnrollmentsService = async (params) => {
  const res = await getMyEnrollmentsApi(params);
  return res.data;
};

export const getEnrollmentStatusService = async (course_id) => {
  const res = await getEnrollmentStatusApi(course_id);
  return res.data.data;
};

export const getCourseStudentsService = async (course_id, params) => {
  const res = await getCourseStudentsApi(course_id, params);
  return res.data;
};