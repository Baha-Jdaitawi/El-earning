import {
  generateQuizApi,
  courseAssistantApi,
  assignmentFeedbackApi,
} from '../api/aiApi.js';

export const generateQuizService = async ({ topic, count, level }) => {
  const res = await generateQuizApi({ topic, count, level });
  return res.data.data;
};

export const courseAssistantService = async ({ question, course_title, lesson_content, conversation_history }) => {
  const res = await courseAssistantApi({ question, course_title, lesson_content, conversation_history });
  return res.data.data.answer;
};

export const assignmentFeedbackService = async ({ submission_content, assignment_title, assignment_description, max_points }) => {
  const res = await assignmentFeedbackApi({ submission_content, assignment_title, assignment_description, max_points });
  return res.data.data;
};