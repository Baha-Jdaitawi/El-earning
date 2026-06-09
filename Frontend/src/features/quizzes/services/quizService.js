import {
  getQuizzesApi,
  getQuizApi,
  createQuizApi,
  updateQuizApi,
  deleteQuizApi,
  submitQuizApi,
  bulkCreateQuizzesApi,
} from '../api/quizzesApi.js';

export const getQuizzesService = async (lesson_id) => {
  const res = await getQuizzesApi(lesson_id);
  return res.data.data;
};

export const getQuizService = async (id) => {
  const res = await getQuizApi(id);
  return res.data.data;
};

export const createQuizService = async (data) => {
  const res = await createQuizApi(data);
  return res.data.data;
};

export const updateQuizService = async (id, data) => {
  const res = await updateQuizApi(id, data);
  return res.data.data;
};

export const deleteQuizService = async (id) => {
  await deleteQuizApi(id);
  return id;
};

export const submitQuizService = async (lesson_id, answers) => {
  const res = await submitQuizApi(lesson_id, answers);
  return res.data.data;
};

export const bulkCreateQuizzesService = async (lesson_id, quizzes) => {
  const res = await bulkCreateQuizzesApi(lesson_id, quizzes);
  return res.data.data;
};