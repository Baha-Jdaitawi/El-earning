import {
  getAssignmentsByLessonApi,
  getAssignmentsByCourseApi,
  getAssignmentApi,
  getUpcomingAssignmentsApi,
  createAssignmentApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  submitAssignmentApi,
  updateSubmissionApi,
  getMySubmissionsApi,
  getSubmissionApi,
  gradeSubmissionApi,
  getPendingSubmissionsApi,
  bulkGradeApi,
} from '../api/assignmentsApi.js';

export const getAssignmentsByLessonService = async (lesson_id) => {
  const res = await getAssignmentsByLessonApi(lesson_id);
  return res.data.data;
};

export const getAssignmentsByCourseService = async (course_id) => {
  const res = await getAssignmentsByCourseApi(course_id);
  return res.data.data;
};

export const getAssignmentService = async (id) => {
  const res = await getAssignmentApi(id);
  return res.data.data;
};

export const getUpcomingAssignmentsService = async (limit) => {
  const res = await getUpcomingAssignmentsApi(limit);
  return res.data.data;
};

export const createAssignmentService = async (data) => {
  const res = await createAssignmentApi(data);
  return res.data.data;
};

export const updateAssignmentService = async (id, data) => {
  const res = await updateAssignmentApi(id, data);
  return res.data.data;
};

export const deleteAssignmentService = async (id) => {
  await deleteAssignmentApi(id);
  return id;
};

export const submitAssignmentService = async (data) => {
  const res = await submitAssignmentApi(data);
  return res.data.data;
};

export const updateSubmissionService = async (id, data) => {
  const res = await updateSubmissionApi(id, data);
  return res.data.data;
};

export const getMySubmissionsService = async (params) => {
  const res = await getMySubmissionsApi(params);
  return res.data.data;
};

export const getSubmissionService = async (id) => {
  const res = await getSubmissionApi(id);
  return res.data.data;
};

export const gradeSubmissionService = async (id, data) => {
  const res = await gradeSubmissionApi(id, data);
  return res.data.data;
};

export const getPendingSubmissionsService = async (params) => {
  const res = await getPendingSubmissionsApi(params);
  return res.data.data;
};

export const bulkGradeService = async (grades) => {
  const res = await bulkGradeApi(grades);
  return res.data.data;
};