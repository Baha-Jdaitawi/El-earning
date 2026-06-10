import {
  getReviewsApi,
  getMyReviewApi,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from '../api/reviewsApi.js';

export const getReviewsService = async (course_id, params) => {
  const res = await getReviewsApi(course_id, params);
  return res.data;
};

export const getMyReviewService = async (course_id) => {
  const res = await getMyReviewApi(course_id);
  return res.data.data;
};

export const createReviewService = async (data) => {
  const res = await createReviewApi(data);
  return res.data.data;
};

export const updateReviewService = async (id, data) => {
  const res = await updateReviewApi(id, data);
  return res.data.data;
};

export const deleteReviewService = async (id) => {
  await deleteReviewApi(id);
  return id;
};