import { useState } from 'react';
import {
  generateQuizService,
  courseAssistantService,
  assignmentFeedbackService,
} from '../services/aiService.js';

export const useQuizGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedQuizzes, setGeneratedQuizzes] = useState([]);

  const generateQuiz = async ({ topic, count = 5, level = 'beginner' }) => {
    setLoading(true);
    setError(null);
    try {
      const quizzes = await generateQuizService({ topic, count, level });
      setGeneratedQuizzes(quizzes);
      return quizzes;
    } catch (err) {
      setError('Failed to generate quiz questions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearQuizzes = () => setGeneratedQuizzes([]);

  return { loading, error, generatedQuizzes, generateQuiz, clearQuizzes };
};

export const useCourseAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  const askQuestion = async ({ question, course_title, lesson_content }) => {
    setLoading(true);
    setError(null);

    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);

    try {
      const answer = await courseAssistantService({
        question,
        course_title,
        lesson_content,
        conversation_history: messages,
      });
      setMessages([...newMessages, { role: 'assistant', content: answer }]);
      return answer;
    } catch (err) {
      setError('Failed to get response. Please try again.');
      setMessages(messages);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { loading, error, messages, askQuestion, clearMessages };
};

export const useAssignmentFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const getFeedback = async ({ submission_content, assignment_title, assignment_description, max_points }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentFeedbackService({
        submission_content,
        assignment_title,
        assignment_description,
        max_points,
      });
      setFeedback(result);
      return result;
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = () => setFeedback(null);

  return { loading, error, feedback, getFeedback, clearFeedback };
};